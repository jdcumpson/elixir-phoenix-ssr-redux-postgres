# This file is responsible for configuring your umbrella
# and **all applications** and their dependencies with the
# help of Mix.Config.
#
# Note that all applications in your umbrella share the
# same configuration and dependencies, which is why they
# all use the same configuration file. If you want different
# configurations or dependencies per app, it is best to
# move said applications out of the umbrella.
use Mix.Config

# Configure Mix tasks and generators
config :quickstart,
  ecto_repos: [Quickstart.Repo],
  # automatically sync RELEASE_ENV with Mix.env, setting a release env
  # separately is only usually good for debugging
  release_env: System.get_env("RELEASE_ENV", Atom.to_string(Mix.env()))

config :quickstart_web,
  ecto_repos: [Quickstart.Repo],
  generators: [context_app: :quickstart, binary_id: true],
  # automatically sync RELEASE_ENV with Mix.env, setting a release env
  # separately is only usually good for debugging
  release_env: System.get_env("RELEASE_ENV", Atom.to_string(Mix.env()))

config :bamboo,
  mailgun_base_uri: "https://api.mailgun.net/v3"

config :quickstart, Quickstart.Mailer,
  adapter: Bamboo.MailgunAdapter,
  domain: "mailgun.quickstart.io",
  api_key: System.get_env("MAILGUN_KEY")

ssr_on = if System.get_env("SSR_ENABLED") == "false", do: false, else: true

# Configures the endpoint
config :quickstart_web, QuickstartWeb.Endpoint,
  url: [host: "localhost"],
  static_url: [host: "localhost", path: "/assets/"],
  secret_key_base: "G75VpFHukbGY0e0bjnwpop27LdA5LXx4jETppzNzlGFPslk4zOak9KHQyyoz2FoG",
  render_errors: [view: QuickstartWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Quickstart.PubSub,
  live_view: [signing_salt: "ynJMcOJm"],
  ssr_on: ssr_on,
  ssr_node_server: [host: "localhost", port: 9905],
  app_names: [:auth, :marketing, :plugin]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
