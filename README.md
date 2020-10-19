# Encrypted File Transfer

An app that allows sending encrypted, password-protected files. Encrypts files on the client side using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Then provides a one-time download link that requires a password to download the file.

## This is an experiment and hasn't been tested in a production environment

### Requirements
* [Elixir](https://elixir-lang.org/) 1.11
* [Phoenix](https://phoenixframework.org/) ~> 1.5.6
* [Node](https://nodejs.org/en/) 12.17.0
* read/write access to an [AWS S3](https://aws.amazon.com/s3/) bucket

### To run locally

* Create `config/dev.secret.exs` if it doesn't already exist, and add the following:  
  ```elixir
    use Mix.Config

    config :ex_aws,
      access_key_id: "<YOUR_ACCESS_KEY_ID>",
      secret_access_key: "<YOUR_SECRET_ACCESS_KEY>",
      region: "<YOUR_BUCKET_REGION>",
      s3: [
        scheme: "https://",
        host: "<YOUR_BUCKET_HOST>",
        region: "<YOUR_BUCKET_REGION>"
      ]
  ```
* Install dependencies with `mix deps.get`
* Create and migrate your database with `mix ecto.setup`
* Install Node.js dependencies with `cd assets && npm install`
* Start Phoenix endpoint with `mix phx.server`
* Visit `http://localhost:4000`