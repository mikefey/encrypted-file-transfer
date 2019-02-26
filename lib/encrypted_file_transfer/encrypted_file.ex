defmodule EncryptedFileTransfer.EncryptedFile do
  use Ecto.Schema
  import Ecto.Changeset
  alias Ecto.UUID, as: UUID
  alias EncryptedFileTransfer.FileStorageService

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "encrypted_files" do
    field :extension, :string
    field :initialization_vector, :string
    field :encrypted_file, :map, virtual: true

    timestamps()
  end

  @doc false
  def changeset(file, attrs \\ %{}) do
    uuid = UUID.generate

    file
    |> cast(attrs, [:id, :extension, :initialization_vector, :encrypted_file])
    |> validate_required([:extension, :initialization_vector, :encrypted_file])
    |> set_id(uuid)
    |> upload_file()
  end

  defp set_id(struct, uuid) do
    put_change(struct, :id, uuid)
  end

  defp upload_file(struct) do
    file = get_field(struct, :encrypted_file)
    key = get_field(struct, :id)
    FileStorageService.upload(file, key)
    struct
  end
end
