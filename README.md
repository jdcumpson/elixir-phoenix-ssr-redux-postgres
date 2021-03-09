# Quickstart.Umbrella

- `mix deps.get`
- `mix ecto.create`
- `mix ecto.migrate`
- `cd nginx`
- `sudo ./add_host.sh`
- `./new_key.sh`
- `./new_csr.sh`
- `./new_cert.sh`
- `./trust_cert.sh`
- `./ln_cert_user_local.sh`
- `./ln_nginx_config.sh`
- `sudo nginx -s reload`
- `cd ..`
- `cd apps/quickstart_web/assets`
- `brew install nvm`
- `brew install npm`
- `npm install -g yarn`
- `nvm install`
- `yarn install`
- `yarn build:dll`
- `yarn serve`
- `cd -`
- `mix phx.server`
- open quickstart.dev:9000
