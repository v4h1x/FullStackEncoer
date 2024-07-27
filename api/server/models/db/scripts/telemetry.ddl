--
-- File generated with SQLiteStudio v3.2.1 on Tue Azar 6 16:08:57 2022
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: telemetry
CREATE TABLE telemetry (
    ts       INTEGER      NOT NULL,
    category VARCHAR (20) NOT NULL,
    name     VARCHAR (20) NOT NULL,
    value    NUMERIC,
    PRIMARY KEY (
        ts,
        category,
        name
    )
);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
