defmodule Quickstart.Yahoo do
  require Logger
  use Agent

  @base_url "https://query1.finance.yahoo.com"
  @ets_cache_table :option_cache
  @use_cache true

  def start_link(_opts \\ []) do
    fp = "option_cache.tab"

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

    Logger.info("#{:ets.tab2list(@ets_cache_table) |> length()} options are cached")

    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def terminate(_reason, _state) do
    PersistentEts.flush(@ets_cache_table)
  end

  # transform - this can go into a schema definition instead!
  defp transform(%{"expiration" => expiry, "strike" => strike} = yahoo_option, type) do
    ask = Map.get(yahoo_option, "ask")
    last = Map.get(yahoo_option, "lastPrice")
    iv = Map.get(yahoo_option, "impliedVolatility", 0)
    price = if ask > 0, do: ask, else: last
    expiry = expiry |> DateTime.from_unix!() |> DateTime.to_date()
    t = max(Date.diff(expiry, Date.utc_today()), 1)

    option = %{
      asking_price: ask,
      expiry: expiry,
      strike_price: strike,
      last_price: last,
      price: price,
      implied_volatility: iv,
      volume: Map.get(yahoo_option, "volume"),
      type: type,
      days_until_expiry: t
    }

    t = max(Date.diff(expiry, Date.utc_today()), 1)
    computed = Quickstart.Investments.black_scholes(last, strike, t / 365, iv, 0, 0)

    computed_option =
      if type == "call", do: get_in(computed, [:call]), else: get_in(computed, [:put])

    Map.merge(option, Map.take(computed_option, [:delta, :theta, :gamma]))
  end

  def get_info(symbol) do
    url = "#{@base_url}/v8/finance/chart/#{symbol}"

    case HTTPoison.get!(url) do
      %HTTPoison.Response{status_code: _, body: body} ->
        case Poison.decode!(body) do
          %{
            "chart" => %{
              "error" => nil,
              "result" => [
                %{
                  "meta" => %{
                    "regularMarketPrice" => price
                  }
                }
              ]
            }
          } ->
            %{
              strike_price: price
            }

          _ ->
            %{}
        end
    end
  end

  def get_options(symbol, expirations \\ nil, strike_prices \\ nil) do
    url = "#{@base_url}/v7/finance/options/#{symbol}"

    case HTTPoison.get!(url) do
      %HTTPoison.Response{status_code: 200, body: body} ->
        case Poison.decode!(body) do
          %{
            "optionChain" => %{
              "result" => [
                %{
                  "expirationDates" => expiration_dates
                }
              ]
            }
          } ->
            dates =
              if is_list(expirations),
                do:
                  Enum.map(expirations, fn date ->
                    {:ok, naive_datetime} = NaiveDateTime.new(date, ~T[00:00:00.000])

                    naive_datetime
                    |> DateTime.from_naive!("Etc/UTC")
                    |> DateTime.to_unix()
                  end),
                else: expiration_dates

            Task.async_stream(
              dates,
              fn date ->
                get_options_for_date(symbol, date, strike_prices)
              end,
              []
            )
            |> Enum.reduce(%{calls: [], puts: []}, fn {:ok, result}, map ->
              map
              |> Map.update!(:calls, &Enum.concat(&1, Map.get(result, :calls, [])))
              |> Map.update!(:puts, &Enum.concat(&1, Map.get(result, :puts, [])))
            end)

          _ ->
            Logger.error("Something bad happened getting options!")
            %{}
        end

      _ ->
        %{}
    end
  end

  defp get_options_for_date(symbol, date, strike_prices) do
    url = "#{@base_url}/v7/finance/options/#{symbol}?date=#{date}"
    cache_key = "#{symbol}-#{date}-#{date_15m()}"

    case {@use_cache, :ets.lookup(@ets_cache_table, cache_key)} do
      {true, [{_key, val}]} ->
        # Logger.info("Returning cached options for: #{symbol} on #{date}")
        val

      _ ->
        case HTTPoison.get!(url) do
          %HTTPoison.Response{status_code: 200, body: body} ->
            case Poison.decode!(body) do
              %{
                "optionChain" => %{
                  "result" => [
                    %{
                      "options" => [options]
                    }
                  ]
                }
              } ->
                %{"calls" => calls, "puts" => puts} = options

                %{
                  calls: Enum.map(calls, fn o -> transform(o, "call") end),
                  puts: Enum.map(puts, fn o -> transform(o, "put") end)
                }

              _ ->
                %{}
            end
            |> (fn result ->
                  :ets.insert(@ets_cache_table, {cache_key, result})
                  result
                end).()

          _ ->
            Logger.error("Something bad happened http request!")
            %{calls: [], puts: []}
        end
    end
    |> (fn %{calls: calls, puts: puts} ->
          %{
            calls: filter_options(calls, strike_prices),
            puts: filter_options(puts, strike_prices)
          }
        end).()
  end

  defp filter_options(options, strike_prices) do
    options
    |> Enum.filter(fn option ->
      if is_nil(strike_prices) do
        true
      else
        Enum.member?(strike_prices, Map.get(option, :strike_price))
      end
    end)
  end

  defp date_15m() do
    now = NaiveDateTime.utc_now()
    mins = floor(now.minute / 15) * 15

    NaiveDateTime.new(now.year, now.month, now.day, now.hour, mins, 0)
    |> elem(1)
    |> NaiveDateTime.to_iso8601()
  end
end
