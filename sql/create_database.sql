CREATE EXTENSION IF NOT EXISTS chkpass;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE USER kontti WITH PASSWORD 'konttipassu';

CREATE DATABASE kontti OWNER kontti;

CREATE TABLE groups (
  gid integer NOT NULL,
  name character varying(32),
  description text
);


ALTER TABLE groups OWNER TO kontti;

COMMENT ON TABLE groups IS 'User groups';


CREATE SEQUENCE groups_gid_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;


ALTER TABLE groups_gid_seq OWNER TO kontti;

ALTER SEQUENCE groups_gid_seq OWNED BY groups.gid;

SET default_with_oids = true;

CREATE TABLE users (
  uid integer NOT NULL,
  gid integer,
  login character varying(16),
  salt uuid,
  password character(65),
  name text,
  enabled boolean
);

ALTER TABLE users OWNER TO kontti;
COMMENT ON TABLE users IS 'Users';

CREATE SEQUENCE users_uid_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER TABLE users_uid_seq OWNER TO kontti;

ALTER SEQUENCE users_uid_seq OWNED BY users.uid;

ALTER TABLE ONLY groups ALTER COLUMN gid SET DEFAULT nextval('groups_gid_seq'::regclass);

ALTER TABLE ONLY users ALTER COLUMN uid SET DEFAULT nextval('users_uid_seq'::regclass);

COPY groups (gid, name, description) FROM stdin;
1       admin   Administrators
\.

SELECT pg_catalog.setval('groups_gid_seq', 1, true);


COPY users (uid, gid, login, salt, password, name, enabled) FROM stdin;
\.

SELECT pg_catalog.setval('users_uid_seq', 1, false);

ALTER TABLE ONLY groups ADD CONSTRAINT groups_name_key UNIQUE (name);
ALTER TABLE ONLY groups ADD CONSTRAINT groups_pkey PRIMARY KEY (gid);
ALTER TABLE ONLY groups ADD CONSTRAINT groups_pkey PRIMARY KEY (gid);

ALTER TABLE ONLY users ADD CONSTRAINT users_login_key UNIQUE (login);
ALTER TABLE ONLY users ADD CONSTRAINT users_password_key UNIQUE (password);
ALTER TABLE ONLY users ADD CONSTRAINT users_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY users ADD CONSTRAINT users_salt_key UNIQUE (salt);
