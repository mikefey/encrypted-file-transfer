defmodule EncryptedFileTransfer.FileStorageService do
  def upload(nil, _key) do
    nil
  end

  def upload(upload_params, key) do
    file = upload_params.path
    file
      |> ExAws.S3.Upload.stream_file
      |> ExAws.S3.upload("/", key)
      |> ExAws.request!
  end

  def download(key) do
    ExAws.S3.get_object("/", key)
      |> ExAws.request
  end

  def destroy(key) do
    ExAws.S3.delete_object("/", key)
      |> ExAws.request
  end
end