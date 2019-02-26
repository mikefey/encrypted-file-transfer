defmodule EncryptedFileTransferWeb.EncryptedFileViewTest do
  use EncryptedFileTransferWeb.ConnCase, async: true

  import Phoenix.View

  test "renders show.json" do
    assert render_to_string(
      EncryptedFileTransferWeb.EncryptedFileView, "show.json",
      %{
        encrypted_file: %{
          extension: "doc",
          id: "ab970c0d-7ef3-4150-8ghi-1j65b8c37b5d",
          initialization_vector: "12,34,567,890,11,12,13,141,516,171,819,20"
        }
      }
    ) == "{\"extension\":\"doc\",\"id\":\"ab970c0d-7ef3-4150-8ghi-1j65b8c37b5d\",\"initialization_vector\":\"12,34,567,890,11,12,13,141,516,171,819,20\"}"
  end
end
