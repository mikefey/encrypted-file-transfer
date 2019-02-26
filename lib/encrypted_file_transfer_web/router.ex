defmodule EncryptedFileTransferWeb.Router do
  use EncryptedFileTransferWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", EncryptedFileTransferWeb do
    pipe_through :browser

    get "/", EncryptedFileController, :new
    post "/", EncryptedFileController, :create
    get "/:id", EncryptedFileController, :show
    post "/download/:id", EncryptedFileController, :download
    delete "/:id", EncryptedFileController, :destroy
  end

  scope "/", EncryptedFileTransferWeb do
    pipe_through :api
  end
end
