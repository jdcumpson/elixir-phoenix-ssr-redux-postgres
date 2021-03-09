defmodule QuickstartWeb.GraphQL.Resolvers.Signup do
  alias Quickstart.Repo
  alias Quickstart.Signup

  def mutation_signup(_parent, args, _context) do
    result =
      Signup.changeset(%Signup{}, args)
      |> Repo.insert()

    case result do
      {:error, error} ->
        {:error, error}

      {:ok, %Signup{email: email}} ->
        QuickstartWeb.Email.send_new_lead(email)
        {:ok, :ok}
    end
  end
end
