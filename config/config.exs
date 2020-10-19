# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :encrypted_file_transfer,
  ecto_repos: [EncryptedFileTransfer.Repo]

# Configures the endpoint
config :encrypted_file_transfer, EncryptedFileTransferWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "Egqm0ogkdK5RLZd3EUkKcOc2GsbvB9G/vpf8eiS0OZSlNT1B0trOHvoF61v+mHi1",
  render_errors: [view: EncryptedFileTransferWeb.ErrorView, accepts: ~w(html json)],
  pubsub_server: EncryptedFileTransfer.PubSub

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
