defmodule EncryptedFileTransferWeb.EncryptedFileController do
  use EncryptedFileTransferWeb, :controller
  alias EncryptedFileTransfer.EncryptedFile
  alias EncryptedFileTransfer.Repo
  alias EncryptedFileTransfer.FileStorageService

  def new(conn, _params) do
    changeset = EncryptedFile.changeset(%EncryptedFile{})
    render(conn, "new.html", changeset: changeset)
  end

  def show(conn, params) do
    id = params["id"]
    render(conn, "show.html", %{id: id})
  end

  def create(conn, params) do
    changeset = EncryptedFile.changeset(%EncryptedFile{}, params)

    case Repo.insert(changeset) do
      {:ok, file} ->
        conn
        |> put_status(:created)
        |> render("show.json", %{encrypted_file: file})
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("error.json", changeset: changeset)
      end
  end

  def download(conn, params) do
    file = Repo.get(EncryptedFile, params["id"])

    case FileStorageService.download(~s(#{params["id"]})) do
      {:ok, encrypted_file} ->
        File.mkdir("priv/static/downloads")
        {:ok, downloaded_file} = File.open ~s(priv/static/downloads/#{params["id"]}), [:write]
        IO.binwrite downloaded_file, encrypted_file.body
        File.close downloaded_file

        conn
        |> put_status(:ok)
        |> render("show.json", %{encrypted_file: file})
      {:error} ->
        conn
        |> put_status(500)
        |> render("error.json")
    end
  end

  def destroy(conn, params) do
    case FileStorageService.destroy(~s(#{params["id"]})) do
      {:ok, _} ->
        File.rm!(~s(priv/static/downloads/#{params["id"]}))
        file_to_delete = Repo.get(EncryptedFile, params["id"])
        Repo.delete(file_to_delete)

        conn
        |> put_status(:ok)
        |> render("delete.json")
      {:error} ->
        conn
        |> put_status(500)
        |> render("error.json")
    end
  end

end
