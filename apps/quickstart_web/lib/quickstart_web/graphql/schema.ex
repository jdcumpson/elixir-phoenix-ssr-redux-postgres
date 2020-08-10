defmodule QuickstartWeb.GraphQL.Schema do
  use Absinthe.Schema
  alias QuickstartWeb.GraphQL.Resolvers
  # import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  import_types(Absinthe.Plug.Types)
  import_types(Absinthe.Type.Custom)

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  def context(ctx) do
    # loader =
    #   Dataloader.new()
    #   |> Dataloader.add_source(Quickstart.Option, Dataloader.Ecto.new(Quickstart.Option.data()))

    # Map.put(ctx, :loader, loader)
    ctx
  end

  defp handle_errors(fun) do
    fn source, args, info ->
      case Absinthe.Resolution.call(fun, source, args, info) do
        {:error, %Ecto.Changeset{} = changeset} -> format_changeset(changeset)
        val -> val
      end
    end
  end

  defp format_changeset(changeset) do
    errors =
      changeset.errors
      |> Enum.map(fn {key, {value, _context}} ->
        [message: "#{key} #{value}"]
      end)

    {:error, errors}
  end

  object :option do
    field(:bid_price, :float)
    field(:median_price, :float)
    field(:asking_price, :float)
    field(:strike_price, :float)
    field(:expiry, :date)
    field(:in_the_money, :boolean)
    field(:last_trade_date, :date)
    field(:last_price, :float)
    field(:volume, :integer)
  end

  object :options do
    field(:symbol, :string)
    field(:calls, list_of(:option))
    field(:puts, list_of(:option))
  end

  object :company do
    field(:symbol, :string)
    field(:strike_price, :integer)
    field(:calls, list_of(:option))
    field(:puts, list_of(:option))
  end

  object :predicted_option_price do
    field(:profit_per_contract, :float)
    field(:date, :date)
    field(:strike_price, :float)
    field(:price_per_option, :float)
    field(:days_until_expiry, :float)
  end

  object :predictions do
    field(:dates, list_of(:date))
    field(:prices, list_of(:float))
    field(:number_of_contracts, :float)
    field(:symbol, :string)
    field(:implied_volatility, :float)
    field(:predictions, list_of(list_of(:predicted_option_price)))
  end

  query do
    field :options, :options do
      arg(:symbol, non_null(:string))
      resolve(handle_errors(&Resolvers.Option.list_options/3))
    end

    field :expected_prices, :predictions do
      arg(:option, :string)
      arg(:expiry, non_null(:date))
      arg(:date, non_null(:date))
      arg(:strike_price, :float)
      arg(:implied_volatility, :float)
      arg(:current_price_per_option, :float)
      arg(:max_strike_price, :float)
      arg(:min_strike_price, :float)
      arg(:number_of_contracts, :float)
      resolve(handle_errors(&Resolvers.Option.predict_option_prices/3))
    end
  end

  # mutation do
  # field :sign_up, :sign_up_response do
  #   arg :email, non_null(:string)
  #   arg :first_name, non_null(:string)
  #   arg :last_name, non_null(:string)
  #   arg :nickname, :string
  #   arg :password, non_null(:string)
  #   arg :subdomain, non_null(:string)
  #   resolve handle_errors(&User.sign_up/3)
  # end
  # end
end
