# Quickstart Elixir Umbrella application

Overview

The goal of this repository is to give an expedient start
to a new project wishing to use the latest (as of March 8, 2021)
technology on the front-end with React/Redux state management
as well as Elixir and Phoenix serving.

This repository is split into 2 sub-applications.

- `quickstart` which contains business logic, and other methods
  specific to doing domain contextual operations - in this case
  responsible for data repository (database) operations. This
  is where you should put things that aren't specific to HTTP
  or serving technology.

- `quickstart_web` which contains web serving concerns. This is
  where specifics for protocol, formatting, emitting requests are
  kept. This is where the API lives and where SSR operations are
  kept.

You should consider adding a new app (see OTP application architecture
for more details) when you are adding a unique functionality to
this project.

If this your first elixir project you will need to do:

- `brew install elixir`

You will also need postgres (10+)

- `brew install postgresql`

You will also need to create a user to connect to, by default the
config is:

```
username: "postgres",
password: "postgres",
database: "quickstart_dev",
```

You can run the following to create `postgres` user:

```
createuser --createdb --pwprompt postgres
```

You will then need to setup this machine - it mimics a productionized
environment by using nginx as a local proxy. Choosing to use nginx
allows for convenient host name usage but also allows for quick
adaption to production environments where nginx is much faster
at serving static bundles - and it's widely available on most linux
distributions.

- `brew install nginx`

Install elixir deps and prep the app for use:

- `mix deps.get` - get the dependencies
- `mix ecto.create` - create the database
- `mix ecto.migrate` - migrate the database schema (initial)

Create a key and certificate for local development

- `cd nginx`
- `sudo ./add_host.sh` - Adds this projects host to your `/etc/hosts` file.
  This allows you to use `https://quickstart.dev:10000` instead of `localhost`
  and/or a local IP.
- `./new_key.sh` - creates a private key
- `./new_csr.sh` - creates a certificate signing request to generate self-signed cert
- `./new_cert.sh` - creates a self-signed certificate
- `./trust_cert.sh` - (MacOS only) trust the certificate for development (may need `sudo`)
- `./ln_cert_user_local.sh` - Link the certificate - if you are not on Intel chipsets you
  will need to do this manually, because brew installs different places. PRs welcome to
  make this work for all distributions.

Link the nginx config you may modify the repository copy instead of copying it

- `./ln_nginx_config.sh` - Link the nginx config - if you are not on Intel chipsets you
  will need to do this manually, because brew installs different places. PRs welcome to
  make this work for all distributions.
- `sudo nginx -s reload` - restart nginx with the new config (enable it)

Install the front-end build dependencies. Use nvm so that prod-like node enivronments will
be used. This project uses node 10 LTS by default.

- `cd ..`
- `cd apps/quickstart_web/assets`
- `brew install nvm` - install nvm if not installed
- `brew install npm` - install npm if not installed
- `nvm install` - install the repo's version in .nvmrc
- `nvm use` - use the repo's version in .nvmrc
- `npm install -g yarn` - install yarn globally

Install the front-end app dependencies

- `yarn install` - installs the dependencies in package.json
- `yarn build:dll` - creates a DLL bundle for dev, this is an optimization
- `yarn serve` - serves the front-end via JS server, the elixir process
  will ask this process for it's manifest.
- `cd -`

Start the back-end server

- `mix phx.server`

Start developing

- open quickstart.dev:9900

Production

- `yarn build:prod` - currently builds reference local filesystem to overcome
  this just I've done `mkdir -p /Users/jd/` && `ln -s /home/ubuntu /Users/jd/workspace`
  that you can copy for your username on the remote machine - TODO: make this agnostic
- `./sync.sh` - sync current app to a remote host (see `./sync.sh`)
- `tmux new -s phx` or `tmux attach -t phx` - use tmux to prevent process culling
- `PORT=9914 MIX_ENV=prod RELEASE_ENV=prod mix phx.server` - run phx server
- `ctrl + b + d`
- `tmux new -s yarn` or `tmux attach -t yarn`
- `cd apps/stonk_options_web/assets`
- `NODE_ENV=production RELEASE_ENV=prod yarn serve` - run yarn ssr server

SSH

For `./sync.sh` to work you need to name the host something your ssh config has,
example:

`ubuntu@qs:/home/ubuntu/quickstart`

you should have a host defined as `qs` in `~/.ssh/config` like:

```
Host qs
  User ubuntu
  Hostname <YOUR EC2 (or other) host>
  IdentityFile ~/.ssh/id_rsa
  ServerAliveInterval 120
  ServerAliveCountMax 30
```

DB (repo)

The fastest thing is to configure an RDS instance, but generally
you'll need to run

```
createuser --host=<DB HOST> --username=<root password> --pwprompt --password --createdb <DESIRED USERNAME>
```

then your `mix ecto.create` etc. commands will work.

Remember to use `MIX_ENV=prod` and `RELEASE_ENV=prod` for elixir (for desired envs) and
`NODE_ENV=production` and `RELEASE_ENV=prod` for node processes.
