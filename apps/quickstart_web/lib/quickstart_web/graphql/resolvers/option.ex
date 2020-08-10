defmodule QuickstartWeb.GraphQL.Resolvers.Option do
  import Ecto.Query
  import Quickstart.Investments
  import Quickstart.Yahoo
  alias Quickstart.Repo
  # alias Quickstart.Schema.{Option}
  require Logger

  def list_options(_source, %{symbol: symbol} = args, _ctx) do
    {:ok, get_options(symbol)}
  end

  def predict_option_prices(
        _source,
        %{
          expiry: expiry,
          date: now,
          current_price_per_option: current_price_per_option,
          strike_price: strike_price,
          implied_volatility: sigma
        } = args,
        _ctx
      )
      when now > expiry do
    {:error,
     "Expiry date must be later than date, cannot predict options in the past - date: #{now} and expiry: #{
       expiry
     }"}
  end

  def predict_option_prices(
        _source,
        %{
          expiry: expiry,
          date: now,
          current_price_per_option: current_price_per_option,
          strike_price: strike_price,
          implied_volatility: sigma
        } = args,
        _ctx
      ) do
    if now > expiry do
      raise "Expiry date must be later than date, cannot predict options in the past - date: #{
              now
            } and expiry: #{expiry}"
    end

    symbol = Map.get(args, :symbol, "?")
    max_strike_price = Map.get(args, :max_strike_price, strike_price * 1.25)
    min_strike_price = Map.get(args, :min_strike_price, strike_price * 0.75)
    number_of_contracts = Map.get(args, :number_of_contracts, 1)
    current_cost = current_price_per_option * number_of_contracts

    # get time to expiry - today
    # partition dates by 30 discrete time buckets (max columns 30)
    # partition price range by 30
    # 30 x 30 grid

    t = Date.diff(expiry, now)
    ideal_time_partition_count = 30
    time_partition_size = max(1, t / ideal_time_partition_count)
    time_partition_count = :math.ceil(t / time_partition_size) |> :math.ceil() |> trunc()

    price_range = max_strike_price - min_strike_price
    ideal_price_partition_count = 30
    price_partition_size = round_price(price_range / ideal_price_partition_count)
    price_partition_count = (price_range / price_partition_size) |> :math.ceil() |> trunc()

    prices =
      Enum.map(0..price_partition_count, fn n ->
        Float.round(min_strike_price + n * price_partition_size, 2)
      end)

    times =
      Enum.map(0..time_partition_count, fn n ->
        Date.add(now, trunc(n * time_partition_size))
      end)

    predictions =
      Enum.map(prices, fn price ->
        Enum.map(times, fn date ->
          t = max(Date.diff(expiry, date), 1)
          result = black_scholes(price, strike_price, t / 365, sigma, 0, 0)

          %{
            strike_price: price,
            date: date,
            profit_per_contract: Float.round((result.call.price - current_cost) * 100, 2),
            price_per_option: Float.round(result.call.price, 2),
            days_until_expiry: t
          }
        end)
      end)

    {:ok,
     %{
       predictions: predictions,
       symbol: symbol,
       implied_volatility: sigma,
       computed_date: now,
       dates: times,
       prices: prices
     }}
  end

  def round_price(price) do
    remainder = (price - Float.floor(price)) * 100
    Float.floor(price) + round(trunc(remainder / 25)) * 25 / 100
  end
end
