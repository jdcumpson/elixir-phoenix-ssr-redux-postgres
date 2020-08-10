defmodule Quickstart.Yahoo do
  require Logger

  @base_url "https://query1.finance.yahoo.com"

  # transform - this can go into a schema definition instead!
  defp transform(%{"ask" => ask, "expiration" => expiry, "strike" => strike} = _yahoo_option) do
    %{
      asking_price: ask,
      expiry: expiry |> DateTime.from_unix!() |> DateTime.to_date(),
      strike_price: strike
    }
  end

  def get_options(symbol) do
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
            Task.async_stream(
              expiration_dates,
              fn date ->
                get_options_for_date(symbol, date)
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
            []
        end

      _ ->
        []
    end
  end

  defp get_options_for_date(symbol, date) do
    url = "#{@base_url}/v7/finance/options/#{symbol}?date=#{date}"

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
            %{calls: Enum.map(calls, &transform/1), puts: Enum.map(puts, &transform/1)}
        end

      _ ->
        Logger.error("Something bad happened http request!")
        %{calls: [], puts: []}
    end
  end
end
