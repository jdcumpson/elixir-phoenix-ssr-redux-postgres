defmodule Quickstart.Repo.Migrations.CreateSignups do
  use Ecto.Migration

  def change do
    create table(:signups, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:email, :string, null: false)
      add(:message, :string)
      add(:metadata, :map)

      timestamps()
    end

    create(unique_index(:signups, [:email]))
  end
end
