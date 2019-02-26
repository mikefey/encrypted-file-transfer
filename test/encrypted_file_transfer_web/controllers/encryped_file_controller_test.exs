defmodule EncryptedFileTransferWeb.EncryptedFileControllerTest do
  use EncryptedFileTransferWeb.ConnCase
  alias EncryptedFileTransfer.EncryptedFile, as: EncryptedFile
  alias EncryptedFileTransfer.Repo, as: Repo
  import Mock

  def upload_params do
    %{
      encrypted_file: %Plug.Upload{
        content_type: "application/octet-stream",
        filename: "blob",
        path: "/var/folders/123/12345678/S//plug-1234/multipart-1234567890-12345678901234567"
      },
      extension: "jpeg",
      initialization_vector: "90,24,44,199,102,10,121,10,129,74,250,214"
    }
  end

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "Encrypted File Transfer"
  end

  test "POST /", %{conn: conn} do
    initialization_vector = "90,24,44,199,102,10,121,10,129,74,250,214"
    extension = "jpeg"
    upload_params = upload_params()
    expected_response = %{
      extension: extension,
      id: "5ccf82d4-459b-4642-a124-5aa771f1a300",
      initialization_vector: initialization_vector
    }

    with_mock EncryptedFileTransfer.FileStorageService, [upload: fn(_params, _key) -> :ok end] do
      conn = post(conn, "/", upload_params)

      assert json_response(conn, 201)["extension"] == expected_response[:extension]
      assert json_response(conn, 201)["initialization_vector"] == expected_response[:initialization_vector]
      assert String.length(json_response(conn, 201)["id"]) == 36
    end
  end

  test "GET /:id", %{conn: conn} do
    conn = get(conn, "/5ccf82d4-459b-4642-a124-5aa771f1a300")
    assert html_response(conn, 200) =~ "Enter password:"
  end

  test "POST /download/:id", %{conn: conn} do
    download_response = %{
      body: <<84, 106, 140, 123, 181, 56, 72, 157, 175, 239, 155, 5, 222, 215, 186,
        1, 199, 209, 250, 185, 124, 32, 229, 25, 37, 173, 240, 211, 100, 166, 108,
        42, 211, 26, 135, 175, 51, 68, 209, 176, 119, 96, 4, 246, 6, 185, 177, 85,
        29>>,
      headers: [
        {"x-amz-id-2", "12345"},
        {"x-amz-request-id", "1234567890123456"},
        {"Date", "Tue, 19 Feb 2019 02:38:42 GMT"},
        {"Last-Modified", "Tue, 19 Feb 2019 02:38:30 GMT"},
        {"ETag", "\"12345678910234459686771234567789-1\""},
        {"Accept-Ranges", "bytes"},
        {"Content-Type", "application/octet-stream"},
        {"Content-Length", "123"},
        {"Server", "AmazonS3"}
      ],
      status_code: 200
    }

    with_mock EncryptedFileTransfer.FileStorageService, [
      upload: fn(_params, _key) -> :ok end,
      download: fn(_key) -> {:ok, download_response} end
    ] do
      upload_params = upload_params = upload_params()

      changeset = EncryptedFile.changeset(%EncryptedFile{}, upload_params)

      case Repo.insert(changeset) do
        {:ok, file} ->
          conn = post(conn, "/download/#{file.id}")
          assert json_response(conn, 200)["initialization_vector"] == file.initialization_vector
          assert json_response(conn, 200)["extension"] == file.extension
          assert json_response(conn, 200)["id"] == file.id
          assert File.exists?(~s(priv/static/downloads/#{file.id})) == true

          File.rm!(~s(priv/static/downloads/#{file.id}))
      end
    end
  end

  test "DELETE /:id", %{conn: conn} do
    with_mock EncryptedFileTransfer.FileStorageService, [
      upload: fn(_params, _key) -> :ok end,
      destroy: fn(_key) -> {:ok, %{}} end
    ] do
      upload_params = upload_params()
      changeset = EncryptedFile.changeset(%EncryptedFile{}, upload_params)
      encrypted_file = %{
        body: <<84, 106, 140, 123, 181, 56, 72, 157, 175, 239, 155, 5, 222, 215, 186,
        1, 199, 209, 250, 185, 124, 32, 229, 25, 37, 173, 240, 211, 100, 166, 108,
        42, 211, 26, 135, 175, 51, 68, 209, 176, 119, 96, 4, 246, 6, 185, 177, 85,
        29>>,
      }

      case Repo.insert(changeset) do
        {:ok, file} ->
          File.mkdir("priv/static/downloads")
          {:ok, downloaded_file} = File.open ~s(priv/static/downloads/#{file.id}), [:write]
          IO.binwrite downloaded_file, encrypted_file.body
          File.close downloaded_file

          delete(conn, "/#{file.id}")
          assert File.exists?(~s(priv/static/downloads/#{file.id})) == false
      end
    end
  end
end
