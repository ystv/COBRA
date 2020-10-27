Schema

CREATE TABLE streamKeys (
    streamKey VARCHAR (24) PRIMARY KEY
                           NOT NULL,
    pwd       VARCHAR (24),
    alias     TEXT,
    start     DATETIME,
    [end]     DATETIME
);
