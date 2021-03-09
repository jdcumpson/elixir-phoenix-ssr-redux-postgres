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

  query do
    field :foo, :string do
      resolve(handle_errors(fn _, _, _ -> "foo" end))
    end
  end

  mutation do
    field :signup, :string do
      arg(:email, non_null(:string))
      arg(:message, :string)
      arg(:metadata, list_of(list_of(:string)))
      resolve(handle_errors(&QuickstartWeb.GraphQL.Resolvers.Signup.mutation_signup/3))
    end
  end
end
