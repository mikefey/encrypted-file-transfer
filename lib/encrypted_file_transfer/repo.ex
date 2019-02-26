defmodule EncryptedFileTransfer.Repo do
  use Ecto.Repo,
    otp_app: :encrypted_file_transfer,
    adapter: Ecto.Adapters.Postgres
end
