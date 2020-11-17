Schema

CREATE TABLE streamKeys (
    streamKey VARCHAR (24) PRIMARY KEY
                           NOT NULL,
    pwd       VARCHAR (24),
    alias     TEXT,
    start     DATETIME,
    [end]     DATETIME
);


yarn start - launches compiled server and client
yarn build - builds client and server

yarn dev - launches both client and server interactively

yarn client:dev - launches React development mode
yarn server:dev - launches interactive server
yarn client - builds just client
yarn server - builds just server

Be sure to set the environment variables in both the root of the project and in the client folder (the latter especially if you are running a live dev copy)