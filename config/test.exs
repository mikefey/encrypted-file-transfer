use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :encrypted_file_transfer, EncryptedFileTransferWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :encrypted_file_transfer, EncryptedFileTransfer.Repo,
  username: "",
  password: "",
  database: "encrypted_file_transfer_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox
