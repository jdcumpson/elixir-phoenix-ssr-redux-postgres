defmodule Quickstart.Signup do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "signups" do
    field(:email, :string, null: false)
    field(:message, :string)
    field(:metadata, :map)

    timestamps()
  end

  @doc false
  def changeset(signup, attrs) do
    signup
    |> cast(attrs, [:email, :message])
    |> cast_list_to_map(attrs, :metadata)
    |> validate_required([:email, :metadata])
    |> unique_constraint(:email)
    |> validate_email(:email)
  end

  defp cast_list_to_map(cs, attrs, key) do
    val = Map.get(attrs, key)

    if is_nil(val) do
      cs
    else
      map = Map.new(val, fn [k, v] -> {k, v} end)
      put_change(cs, :metadata, map)
    end
  end

  defp validate_email(cs, key) do
    validate_change(cs, key, :email, fn field, value ->
      case EmailChecker.valid?(value) do
        true -> []
        _ -> [{field, "could not validate"}]
      end
    end)
  end
end
