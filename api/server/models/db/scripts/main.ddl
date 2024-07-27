--
-- File generated with SQLiteStudio v3.2.1 on Tue Azar 6 17:39:14 2022
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;

-- Table: authorities
CREATE TABLE authorities (
    name         VARCHAR (50)  NOT NULL,
    display_name VARCHAR (250),
    PRIMARY KEY (
        name
    ),
    CONSTRAINT authority_name_unique UNIQUE (
        name
    )
);

INSERT INTO authorities (name, display_name) VALUES ('CREATE_JOBS', 'create, delete or modify jobs');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_JOBS', 'view jobs list');
INSERT INTO authorities (name, display_name) VALUES ('CONTROL_JOBS', 'control jobs');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_JOB_DETAIL', 'view job''s detailed information');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_JOB_LOG', 'view job''s output and logs');
INSERT INTO authorities (name, display_name) VALUES ('CREATE_USERS', 'create, delete or modify users');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_USERS', 'view users list');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_TELEMETRIES', 'view monitoring data');
INSERT INTO authorities (name, display_name) VALUES ('CLEAR_TELEMETRIES', 'clear monitoring data');
INSERT INTO authorities (name, display_name) VALUES ('VIEW_LOGS', 'view management logs');
INSERT INTO authorities (name, display_name) VALUES ('CLEAR_LOGS', 'clear management logs');

-- Table: jobs
CREATE TABLE jobs (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    name       VARCHAR  UNIQUE
                        NOT NULL,
    type       VARCHAR  NOT NULL,
    command    TEXT     NOT NULL,
    status     VARCHAR,
    date_added DATETIME,
    user_id    INTEGER  NOT NULL
                        REFERENCES users (id) ON DELETE RESTRICT
                                              ON UPDATE CASCADE,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (id) ON DELETE RESTRICT
                          ON UPDATE CASCADE
);


-- Table: role_authorities
CREATE TABLE role_authorities (
    role      VARCHAR (250) NOT NULL,
    authority VARCHAR (50)  NOT NULL,
    CONSTRAINT FK_role_authorities_1 FOREIGN KEY (
        role
    )
    REFERENCES roles (name) ON DELETE CASCADE
                            ON UPDATE CASCADE,
    CONSTRAINT FK_role_authorities_0 FOREIGN KEY (
        authority
    )
    REFERENCES authorities (name) ON DELETE CASCADE
                                  ON UPDATE CASCADE
);

INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'CLEAR_TELEMETRIES');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'CONTROL_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'CREATE_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'CREATE_USERS');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_JOB_DETAIL');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_JOB_LOG');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_LOGS');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_TELEMETRIES');
INSERT INTO role_authorities (role, authority) VALUES ('ADMIN', 'VIEW_USERS');
INSERT INTO role_authorities (role, authority) VALUES ('MONITORING', 'VIEW_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('MONITORING', 'VIEW_TELEMETRIES');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L1', 'VIEW_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L1', 'VIEW_TELEMETRIES');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L1', 'CONTROL_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L2', 'VIEW_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L2', 'VIEW_TELEMETRIES');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L2', 'VIEW_JOB_DETAIL');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L2', 'CONTROL_JOBS');
INSERT INTO role_authorities (role, authority) VALUES ('OPERATOR L2', 'VIEW_JOB_LOG');

-- Table: roles
CREATE TABLE roles (
    name VARCHAR (50) UNIQUE
                    PRIMARY KEY
);

INSERT INTO roles (name) VALUES ('OPERATOR L1');
INSERT INTO roles (name) VALUES ('MONITORING');
INSERT INTO roles (name) VALUES ('ADMIN');
INSERT INTO roles (name) VALUES ('OPERATOR L2');

-- Table: users
CREATE TABLE users (
    id         INTEGER       PRIMARY KEY AUTOINCREMENT,
    username   VARCHAR (255) UNIQUE
                             NOT NULL,
    email      VARCHAR       UNIQUE
                             NOT NULL,
    password   VARCHAR (255) NOT NULL,
    date_added DATETIME      NOT NULL,
    role       VARCHAR (255) NOT NULL,
    FOREIGN KEY (
        role
    )
    REFERENCES roles (name) 
);

INSERT INTO users (id, username, email, password, date_added, role) VALUES (1, 'admin', 'admin@irib.ir', '$2b$10$Cef3AB32g2EBj0LBjYjC4eyrFIzYoDwxPNNALoy0Um4h/SfTFwPH6', '2021-02-10T06:52:10.249Z', 'ADMIN');

PRAGMA foreign_keys = on;
