defmodule Quickstart.Investments do
  use Agent
  require Logger

  # http://people.math.sfu.ca/~cbm/aands/page_932.htm
  @probabilty 0.2316419
  @b1 0.319381530
  @b2 -0.356563782
  @b3 1.781477937
  @b4 -1.821255978
  @b5 1.330274429
  @standard_normal_normalizing_constant 1 / :math.sqrt(2 * :math.pi())
  @ets_cache_table :prediction_cache

  def start_link(_opts \\ []) do
    fp = "prediction_cache.tab"

    # PersistentEts doesn't like empty files
    if File.exists?(fp) and String.length(File.read!(fp)) == 0 do
      File.rm!(fp)
      Logger.warn("Removed stale persisted ets file")
    end

    PersistentEts.new(
      @ets_cache_table,
      fp,
      [:named_table, :set, :public, persist_every: 30_000]
    )

    Logger.info("#{:ets.tab2list(@ets_cache_table) |> length()} predictions are cached")

    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def terminate(_reason, _state) do
    PersistentEts.flush(@ets_cache_table)
  end

  def pdf(x) do
    @standard_normal_normalizing_constant * :math.exp(-0.5 * :math.pow(x, 2))
  end

  def cdf(x) do
    if x == 0 do
      0.5
    else
      {x, intercept, slope} = if x <= 0, do: {-1 * x, 0, 1}, else: {x, 1, -1}
      t = 1 / (1 + @probabilty * x)

      intercept +
        slope * pdf(x) *
          (@b1 * t + @b2 * :math.pow(t, 2) + @b3 * :math.pow(t, 3) + @b4 * :math.pow(t, 4) +
             @b5 * :math.pow(t, 5))
    end
  end

  def discount_factor(r, t) do
    :math.exp(-r * t)
  end

  @doc """
  s1 - spot price first asset
  s2 - spot price second asset
  t - time to maturity
  sigma - volatility of the ratio of both assets
  q1 - dividend yield first asset
  q2 - dividend yield second asset
  scale - scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed

  Margrabe's formula for pricing the exchange option between two risky assets.

  See William  Margrabe, [The Value of an Option to Exchange One Asset for Another](http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf),
  Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.
  """
  def margrabes_short(s1, s2, t, sigma, q1, q2, scale \\ 1) do
    sigma = if sigma == 0, do: 0.000001, else: sigma
    sigma_sqrt_t = sigma * :math.sqrt(t)
    log_simple_moneyness = :math.log(s1 / s2) + (q2 - q1) * t

    d1 = (log_simple_moneyness + :math.pow(sigma, 2) / 2 * t) / sigma_sqrt_t
    d2 = d1 - sigma_sqrt_t
    cumulative_dist_d1 = cdf(d1)
    cumulative_dist_d2 = cdf(d2)
    discount_factor_1 = discount_factor(q1, t)
    discount_factor_2 = discount_factor(q2, t)
    pdf_d1 = pdf(d1)

    %{
      call: %{
        price:
          scale *
            (discount_factor_1 * s1 * cumulative_dist_d1 -
               discount_factor_2 * s2 * cumulative_dist_d2),
        delta: scale * discount_factor_1 * cumulative_dist_d1,
        gamma: scale * discount_factor_1 * pdf_d1 / sigma_sqrt_t / s1,
        theta:
          1 / 365 *
            (-1 * discount_factor_1 * pdf_d1 * sigma * s1 / :math.sqrt(t) / 2 -
               q2 * s2 * discount_factor_2 * cumulative_dist_d2 +
               q1 * s1 * discount_factor_1 * cumulative_dist_d1),
        moneyness: log_simple_moneyness / sigma_sqrt_t,
        log_moneyness: log_simple_moneyness,
        scale: scale
      },
      put: %{
        price:
          scale *
            (discount_factor_2 * s2 * (1 - cumulative_dist_d2) -
               discount_factor_1 * s1 * (1 - cumulative_dist_d1)),
        delta: scale * discount_factor_1 * (1 - cumulative_dist_d1),
        gamma: scale * discount_factor_1 * pdf_d1 / sigma_sqrt_t / s1,
        theta:
          1 / 365 *
            (-1 * discount_factor_1 * pdf_d1 * sigma * s1 / :math.sqrt(t) / 2 +
               q2 * s2 * discount_factor_2 * cdf(-d2) +
               q1 * s1 * discount_factor_1 * cdf(-d1)),
        moneyness: -1 * log_simple_moneyness / sigma_sqrt_t,
        log_moneyness: -1 * log_simple_moneyness,
        scale: scale
      },
      cumulative_distribution_1: cumulative_dist_d1,
      cumulative_distribution_2: cumulative_dist_d2,
      d1: d1,
      d2: d2,
      sigma: sigma,
      sigma_sqrt_t: sigma_sqrt_t,
      discount_factor_1: discount_factor_1,
      discount_factor_2: discount_factor_2
    }
  end

  @doc """
  s - spot price of option (current market price at some time)
  k - exercise price (price of the stock when exercised)
  t - time to maturity
  sigma - implied volatility of underlying asset
  r - risk-free interest rate (constant between t)
  q - dividend rate of the asset
  """
  def black_scholes(s, k, t, sigma, q, r, scale \\ 1.0) do
    cache_key = "#{date_15m()}-#{s}-#{k}-#{t}-#{sigma}-#{q}-#{r}-#{scale}"

    case :ets.lookup(@ets_cache_table, cache_key) do
      [{_key, val}] ->
        # Logger.info("Returning cached values for #{cache_key}")
        val

      _ ->
        val = margrabes_short(s, k, t, sigma, q, r, scale)
        :ets.insert(@ets_cache_table, {cache_key, val})
        val
    end
  end

  defp date_15m do
    now = NaiveDateTime.utc_now()
    mins = floor(now.minute / 15) * 15

    NaiveDateTime.new(now.year, now.month, now.day, now.hour, mins, 0)
    |> elem(1)
    |> NaiveDateTime.to_iso8601()
  end
end
