# COBRA

DEPRACATED MONOREPO IN FAVOUR OF SEPARATED SERVER AND CLIENT REPOS

- [COBRA](#cobra)
  - [About](#about)
  - [WARNING](#warning)
  - [Setup](#setup)
  - [Running](#running)
  - [Feature Timeline](#feature-timeline)
    - [Main](#main)
    - [Other](#other)
  - [Schema](#schema)


## About
(More info coming later)

Puts basic obfuscation infront of nginx with passwords or long stream keys.

Allows stream keys to be scoped and expire by date/time for easier collaboration with 3rd parties.

Neat admin interface for managing keys.

GraphQL data interface for Nginx RTMP module (polls stat page ever second and sends updates over gql subscriptions)

client software auth done by checking cookies for cookie "token" containing jwt with the data form {..., perms: [{..., name: "SuperUser"}]}
## WARNING

The "passwords" for the streamkeys might be sent from clients over the insecure rtmp and should be treated as such! Please do not use an actual password as they can also be viewed by the admin pannel. The "passwords" are only to provide a layer more complexity to people trying to brute force onto a streaming server.

Similarly with the admin interface, this does not natively support https yet so traffic sent will be insecure! We suggest using a reverse proxy from an SSL enabled nginx server on a secure network for now.

Finally this is very alpha software right now, more development is intended but use in production at your own risk.

## Setup
Requires yarn

Modify nginx config...(more details later)

send nginx rtmp on_publish to {address}/key-check

stream should go to rtmp://{nginx_address}:1935/{application}/{streamkey}?pwd={password}

## Running
Be sure to set the environment variables in both the root of the project and in the client folder (the latter especially if you are running a live dev copy)

`yarn start` - launches compiled server and client

`yarn build` - builds client and server

---

`yarn dev` - launches both client and server interactively

---

`yarn client:dev` - launches React development mode

`yarn server:dev` - launches interactive server

`yarn client` - builds just client

`yarn server` - builds just server



## Feature Timeline
### Main
- [x] Milestone 1 - streamkeys
- [ ] Milestone 2 - ffmpeg forwarding to RTMP (SRT, Icecast)
- [ ] Milestone 3 - ASP & BOA support

### Other
- [ ] SRT support via SLS
- [ ] Playback authentication
- [ ] Public streams endpoint
- [ ] Setup guide
- [ ] NGINX RTMP control module support
- [ ] Other database support

## Schema
```
CREATE TABLE streamKeys (
    streamKey VARCHAR (24) PRIMARY KEY
                           NOT NULL,
    pwd       VARCHAR (24),
    alias     TEXT,
    start     DATETIME,
    [end]     DATETIME
);
```
