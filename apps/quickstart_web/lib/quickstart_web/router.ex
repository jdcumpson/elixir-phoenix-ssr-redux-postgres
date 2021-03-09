defmodule QuickstartWeb.Router do
  use QuickstartWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    # plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through(:browser)
      live_dashboard("/dashboard", metrics: QuickstartWeb.Telemetry)
    end
  end

  scope "/graphiql" do
    pipe_through([:api])

    forward("/", Absinthe.Plug.GraphiQL, schema: QuickstartWeb.GraphQL.Schema)
    # socket: TubexWeb.GraphQL.UserSocket,
    # before_send: {__MODULE__, :absinthe_before_send}
  end

  scope "/api/graphql" do
    pipe_through([:browser, :api])

    forward("/", Absinthe.Plug,
      schema: QuickstartWeb.GraphQL.Schema
      # socket: Illicit.GraphQL.UserSocket,
      # before_send: {__MODULE__, :absinthe_before_send}
    )
  end

  scope "/", QuickstartWeb do
    pipe_through(:browser)

    get("/favicon.ico", PageController, :not_found)
    get("/email/*path", EmailController, :index)
    get("/*path", PageController, :index)
  end

  # Other scopes may use custom stacks.
  # scope "/api", QuickstartWeb do
  #   pipe_through :api
  # end
end
