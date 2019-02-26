defmodule EncryptedFileTransfer.Repo.Migrations.CreateFiles do
  use Ecto.Migration

  def change do
    create table(:encrypted_files, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :extension, :string
      add :initialization_vector, :string

      timestamps()
    end

  end
end
