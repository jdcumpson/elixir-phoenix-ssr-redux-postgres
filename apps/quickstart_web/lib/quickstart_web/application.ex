defmodule QuickstartWeb.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      QuickstartWeb.Telemetry,
      QuickstartWeb.Presence,
      # Start the Endpoint (http/https)
      QuickstartWeb.Endpoint,
      QuickstartWeb.Manifest
      # Start a worker by calling: QuickstartWeb.Worker.start_link(arg)
      # {QuickstartWeb.Worker, arg}
    ]

    children =
      if Application.get_env(:quickstart_web, :manifest_cache) do
        children ++ [Application.get_env(:quickstart_web, :manifest_cache)]
      else
        children
      end

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: QuickstartWeb.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    QuickstartWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
