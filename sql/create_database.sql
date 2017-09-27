CREATE EXTENSION IF NOT EXISTS chkpass;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE USER kontti WITH PASSWORD 'konttipassu';

CREATE DATABASE kontti OWNER kontti;

-- Grous-table
CREATE TABLE groups (
  gid integer NOT NULL,
  name character varying(32),
  description text
);

ALTER TABLE groups OWNER TO kontti;

COMMENT ON TABLE groups IS 'User groups';

CREATE SEQUENCE groups_gid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE groups_gid_seq OWNER TO kontti;
ALTER SEQUENCE groups_gid_seq OWNED BY groups.gid;
ALTER TABLE ONLY groups ALTER COLUMN gid SET DEFAULT nextval('groups_gid_seq'::regclass);
INSERT INTO groups (gid, name, description) VALUES (1,'admin', 'Administrators');
SELECT pg_catalog.setval('groups_gid_seq', 1, true);
ALTER TABLE ONLY groups ADD CONSTRAINT groups_name_key UNIQUE (name);
ALTER TABLE ONLY groups ADD CONSTRAINT groups_pkey PRIMARY KEY (gid);


SET default_with_oids = true;

-- Users table

CREATE TABLE users (
  uid integer NOT NULL,
  gid integer,
  login character varying(16),
  level integer,
  salt character(29),
  password character(60),
  name text,
  enabled boolean
);

ALTER TABLE users OWNER TO kontti;
COMMENT ON TABLE users IS 'Users';

CREATE SEQUENCE users_uid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE users_uid_seq OWNER TO kontti;
ALTER SEQUENCE users_uid_seq OWNED BY users.uid;
ALTER TABLE ONLY users ALTER COLUMN uid SET DEFAULT nextval('users_uid_seq'::regclass);
INSERT INTO users (uid, gid, login, salt, password, name, enabled)
VALUES (1, 1, 'admin', gen_salt('bf', 8), '', 'Administrator', TRUE);
UPDATE users SET password = crypt('US_admin_passu', salt) WHERE uid = 1;
SELECT pg_catalog.setval('users_uid_seq', 1, false);

ALTER TABLE ONLY users ADD CONSTRAINT users_login_key UNIQUE (login);
ALTER TABLE ONLY users ADD CONSTRAINT users_password_key UNIQUE (password);
ALTER TABLE ONLY users ADD CONSTRAINT users_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY users ADD CONSTRAINT users_salt_key UNIQUE (salt);

-- Fills table

CREATE TABLE fills (
  uid integer NOT NULL,
  fill_datetime timestamp with time zone,
  gas_level_id integer,
  fill_type character varying(12),
  cyl_type character varying(12),
  cyl_count integer,
  cyl_size float,
  start_pressure integer,
  end_pressure integer,
  o2_start integer,
  o2_end integer,
  he_start integer,
  he_end integer,
  o2_vol integer,
  he_vol integer,
  counted BOOLEAN,
  counted_date timestamp with time zone
  );

-- Fill levels

CREATE TABLE fill_level (
  level_id integer NOT NULL,
  description text
);

ALTER TABLE ONLY fill_level ADD CONSTRAINT fill_level_id_key UNIQUE (level_id);

INSERT INTO fill_level VALUES (10,'air fill');
INSERT INTO fill_level VALUES (20,'Nitrox fill');
INSERT INTO fill_level VALUES (30,'O2 fill');
INSERT INTO fill_level VALUES (40,'Trimix fill');

-- Gas level

CREATE TABLE gas_level (
  gas_id integer NOT NULL,
  min_fill_level integer NOT NULL,
  gas_key character varying(12)
);

ALTER TABLE ONLY gas_level ADD CONSTRAINT gas_level_id_key UNIQUE (gas_id);

INSERT INTO gas_level VALUES (10, 10, 'air');
INSERT INTO gas_level VALUES (20, 20, 'nx');
INSERT INTO gas_level VALUES (30, 30, 'o2');
INSERT INTO gas_level VALUES (40, 40, 'tx');
