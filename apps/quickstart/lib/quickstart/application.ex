defmodule Quickstart.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Quickstart.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Quickstart.PubSub},
      # Start a worker by calling: Quickstart.Worker.start_link(arg)
      # {Quickstart.Worker, arg}
      Quickstart.Tickers,
      Quickstart.Yahoo,
      Quickstart.Investments
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: Quickstart.Supervisor)
  end
end
