defmodule QuickstartWeb.GraphQL.Resolvers.Option do
  import Ecto.Query
  import Quickstart.Investments
  import Quickstart.Yahoo
  alias Quickstart.Repo
  alias Quickstart.Tickers
  # alias Quickstart.Schema.{Option}
  require Logger

  def list_options(source, args, _ctx) do
    symbol = Map.get(args, "symbol", Map.get(source, :symbol))
    {:ok, get_options(symbol, Map.get(args, :expirations), Map.get(args, :strike_prices))}
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

  # def predict_option_prices(
  #       _source,
  #       %{
  #         expiry: expiry,
  #         date: now,
  #         current_price_per_option: current_price_per_option,
  #         strike_price: strike_price,
  #         implied_volatility: sigma
  #       } = args,
  #       _ctx
  #     ) do
  #   if now > expiry do
  #     raise "Expiry date must be later than date, cannot predict options in the past - date: #{
  #             now
  #           } and expiry: #{expiry}"
  #   end

  #   symbol = Map.get(args, :symbol, "?")
  #   max_strike_price = Map.get(args, :max_strike_price, strike_price * 1.25)
  #   min_strike_price = Map.get(args, :min_strike_price, strike_price * 0.75)
  #   number_of_contracts = Map.get(args, :number_of_contracts, 1)
  #   current_cost = current_price_per_option * number_of_contracts

  #   # get time to expiry - today
  #   # partition dates by 30 discrete time buckets (max columns 30)
  #   # partition price range by 30
  #   # 30 x 30 grid

  #   t = Date.diff(expiry, now)
  #   ideal_time_partition_count = 30
  #   time_partition_size = max(1, t / ideal_time_partition_count)
  #   time_partition_count = :math.ceil(t / time_partition_size) |> :math.ceil() |> trunc()

  #   price_range = max_strike_price - min_strike_price
  #   ideal_price_partition_count = 30
  #   price_partition_size = round_price(price_range / ideal_price_partition_count)
  #   price_partition_count = (price_range / price_partition_size) |> :math.ceil() |> trunc()

  #   prices =
  #     Enum.map(0..price_partition_count, fn n ->
  #       Float.round(min_strike_price + n * price_partition_size, 2)
  #     end)

  #   times =
  #     Enum.map(0..time_partition_count, fn n ->
  #       Date.add(now, trunc(n * time_partition_size))
  #     end)

  #   predictions =
  #     Enum.map(prices, fn price ->
  #       Enum.map(times, fn date ->
  #         t = max(Date.diff(expiry, date), 1)
  #         result = black_scholes(price, strike_price, t / 365, sigma, 0, 0)

  #         %{
  #           strike_price: price,
  #           date: date,
  #           profit_per_contract: Float.round((result.call.price - current_cost) * 100, 2),
  #           price_per_option: Float.round(result.call.price, 2),
  #           days_until_expiry: t
  #         }
  #       end)
  #     end)

  #   {:ok,
  #    %{
  #      predictions: predictions,
  #      symbol: symbol,
  #      implied_volatility: sigma,
  #      computed_date: now,
  #      dates: times,
  #      prices: prices
  #    }}
  # end

  def predict_option_prices_from_source(
        source,
        args,
        _ctx
      ) do
    %{
      expiry: expiry,
      strike_price: option_strike_price,
      price: option_price,
      implied_volatility: iv,
      type: type,
      symbol: symbol
    } = source

    now = Date.utc_today()

    if Date.compare(now, expiry) == :gt do
      raise "Expiry date must be later than date, cannot predict options in the past - date: #{
              now
            } and expiry: #{expiry}"
    end

    %{strike_price: strike_price} = get_info(symbol)
    current_price_per_option = Map.get(args, :price_paid, option_price)
    max_strike_price = Map.get(args, :max_strike_price, strike_price * 1.15)
    min_strike_price = Map.get(args, :min_strike_price, strike_price * 0.85)
    number_of_contracts = Map.get(args, :number_of_contracts, 1)
    total_cost = current_price_per_option * 100 * number_of_contracts

    t = Date.diff(expiry, now)
    ideal_time_partition_count = 14
    time_partition_size = min(max(1, t / ideal_time_partition_count), 60)
    time_partition_count = :math.ceil(t / time_partition_size) |> :math.ceil() |> trunc()

    price_range = max_strike_price - min_strike_price
    ideal_price_partition_count = 14

    price_partition_size =
      max(min(round_price(price_range / ideal_price_partition_count), 100), strike_price * 0.01)

    price_partition_count = (price_range / price_partition_size) |> :math.ceil() |> trunc()

    prices =
      Enum.map(0..price_partition_count, fn n ->
        Float.round(min_strike_price + n * price_partition_size, 2)
      end)

    prices =
      if not Enum.member?(prices, option_strike_price) do
        prices
        |> List.insert_at(0, option_strike_price)
        |> Enum.sort()
      else
        prices
      end

    times =
      Enum.map(0..time_partition_count, fn n ->
        Date.add(now, trunc(n * time_partition_size))
      end)

    sigma =
      implied_volatility(
        type,
        option_price,
        strike_price,
        option_strike_price,
        t / 365,
        0.1,
        0
      )

    IO.puts("sigma: #{sigma}")
    IO.puts("iv: #{iv}")

    predictions =
      Enum.map(prices, fn future_strike_price ->
        Enum.map(times, fn date ->
          t = max(Date.diff(expiry, date), 1)

          result = black_scholes(future_strike_price, strike_price, t / 365, sigma, 0.1, 0)
          option = if type == "call", do: get_in(result, [:call]), else: get_in(result, [:put])

          profit =
            Float.round(
              max(
                option.price * 100 * number_of_contracts -
                  total_cost,
                -total_cost
              ),
              2
            )

          %{
            strike_price: future_strike_price,
            date: date,
            expiry: expiry,
            profit: profit,
            profit_per_contract: profit / number_of_contracts,
            cost: Float.round(current_price_per_option * 100 * number_of_contracts, 2),
            price_per_option: current_price_per_option,
            value: Float.round(option.price * 100 * number_of_contracts, 2),
            value_per_contract: Float.round(option.price * 100, 2),
            days_until_expiry: t,
            delta: option.delta,
            theta: option.theta,
            gamma: option.gamma
          }
        end)
      end)
      |> Enum.reverse()

    {:ok, predictions}
  end

  def list_companies(_, args, _) do
    symbols = Map.get(args, :symbols)
    fetch_details = Map.get(args, :fetch_details, false)
    companies = if is_list(symbols), do: Tickers.get(symbols), else: Tickers.get_all()

    companies =
      if fetch_details == true do
        companies
        |> Task.async_stream(&get_company_info/1, max_concurrency: 8)
        |> Enum.map(fn {_, val} -> val end)
      else
        companies
      end

    {:ok, companies}
  end

  defp round_price(price) do
    remainder = (price - Float.floor(price)) * 100
    max(1, Float.floor(price) + round(trunc(remainder / 25)) * 25 / 100)
  end

  defp get_company_info(%{symbol: symbol} = company) do
    Map.merge(company, Quickstart.Yahoo.get_info(symbol))
  end
end
