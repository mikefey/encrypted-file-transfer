defmodule EncryptedFileTransferWeb.EncryptedFileView do
  use EncryptedFileTransferWeb, :view

  def render("show.json", %{encrypted_file: encrypted_file}) do
    render_one(encrypted_file, EncryptedFileTransferWeb.EncryptedFileView, "encrypted_file.json")
  end

  def render("encrypted_file.json", %{encrypted_file: encrypted_file}) do
    %{
      extension: encrypted_file.extension,
      id: encrypted_file.id,
      initialization_vector: encrypted_file.initialization_vector
    }
  end

  def render("delete.json", _assigns) do
    %{success: true}
  end
end
