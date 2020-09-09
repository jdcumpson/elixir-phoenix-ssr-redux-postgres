defmodule Quickstart.Tickers do
  use Agent

  @spec start_link(any) :: {:error, any} | {:ok, pid}
  @doc """
  Nasdaq Traded|Symbol|Security Name|Listing Exchange|Market Category|ETF|Round Lot Size|Test Issue|Financial Status|CQS Symbol|NASDAQ Symbol|NextShares
  """
  def start_link(_opts \\ []) do
    :application.start(:inets)
    Application.ensure_all_started(Quickstart)

    {:ok, pid} =
      :inets.start(:ftpc,
        host: "ftp.nasdaqtrader.com" |> String.to_charlist(),
        mode: :passive
      )

    :ftp.user(
      pid,
      "anonymous" |> String.to_charlist(),
      "anonymous" |> String.to_charlist()
    )

    :ftp.cd(pid, "/SymbolDirectory/" |> String.to_charlist())

    {:ok, string} = :ftp.recv_bin(pid, "nasdaqtraded.txt" |> String.to_charlist())

    state =
      string
      |> String.split("\r\n")
      |> Stream.map(&"#{&1}")
      |> Stream.drop(-2)
      |> CSV.decode!(headers: true, separator: ?|)
      |> Stream.map(&transform/1)
      |> Stream.filter(&filter/1)
      |> Enum.to_list()

    Agent.start_link(fn -> state end, name: __MODULE__)
  end

  def get_all() do
    Agent.get(__MODULE__, & &1)
  end

  def get(symbols) when is_list(symbols) do
    symbols = Enum.map(symbols, &String.upcase(&1))

    Agent.get(__MODULE__, & &1)
    |> Stream.filter(fn %{symbol: symbol} ->
      String.upcase(symbol) in symbols
    end)
    |> Enum.to_list()
  end

  defp transform(%{
         "CQS Symbol" => _,
         "ETF" => etf,
         "Financial Status" => _,
         "Listing Exchange" => listing_exchange,
         "Market Category" => market_category,
         "NASDAQ Symbol" => nasdaq_symbol,
         "Nasdaq Traded" => nasdaq_traded,
         "NextShares" => _,
         "Round Lot Size" => _,
         "Security Name" => security_name,
         "Symbol" => symbol,
         "Test Issue" => _
       }) do
    %{
      is_etf: etf == "N",
      listing_exchange: listing_exchange,
      category:
        if market_category == "S" do
          :stock
        else
          :other
        end,
      symbol: symbol,
      traded: nasdaq_traded == "Y",
      name: security_name,
      nasdaq_symbol: nasdaq_symbol
    }
  end

  defp filter(%{traded: traded}) do
    traded == true
  end
end
