CREATE USER kontti WITH PASSWORD 'konttipassu';

CREATE DATABASE kontti OWNER kontti;

\c kontti;

CREATE EXTENSION IF NOT EXISTS chkpass;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grous-table
CREATE TABLE groups (
  gid         INTEGER NOT NULL,
  name        CHARACTER VARYING(32),
  description TEXT
);

ALTER TABLE groups
  OWNER TO kontti;

COMMENT ON TABLE groups IS 'User groups';

CREATE SEQUENCE groups_gid_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE groups_gid_seq
  OWNER TO kontti;
ALTER SEQUENCE groups_gid_seq
OWNED BY groups.gid;
ALTER TABLE ONLY groups
  ALTER COLUMN gid SET DEFAULT nextval('groups_gid_seq' :: REGCLASS);
INSERT INTO groups (gid, name, description) VALUES (1, 'admin', 'Administrators');
SELECT pg_catalog.setval('groups_gid_seq', 1, TRUE);
ALTER TABLE ONLY groups
  ADD CONSTRAINT groups_name_key UNIQUE (name);
ALTER TABLE ONLY groups
  ADD CONSTRAINT groups_pkey PRIMARY KEY (gid);


SET default_with_oids = TRUE;

-- Users table

CREATE TABLE users (
  uid      INTEGER NOT NULL,
  gid      INTEGER,
  login    CHARACTER VARYING(16),
  level    INTEGER,
  salt     CHARACTER(29),
  password CHARACTER(60),
  name     TEXT,
  enabled  BOOLEAN
);

ALTER TABLE users
  OWNER TO kontti;
COMMENT ON TABLE users IS 'Users';

CREATE SEQUENCE users_uid_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER TABLE users_uid_seq
  OWNER TO kontti;
ALTER SEQUENCE users_uid_seq
OWNED BY users.uid;
ALTER TABLE ONLY users
  ALTER COLUMN uid SET DEFAULT nextval('users_uid_seq' :: REGCLASS);
INSERT INTO users (uid, gid, login, level, salt, password, name, enabled) VALUES
  (1, 1, 'admin', 60, gen_salt('bf', 8), '', 'Administrator', TRUE);
UPDATE users
SET password = crypt('madmin', salt)
WHERE uid = 1;

ALTER TABLE ONLY users
  ADD CONSTRAINT users_login_key UNIQUE (login);
ALTER TABLE ONLY users
  ADD CONSTRAINT users_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY users
  ADD CONSTRAINT users_salt_key UNIQUE (salt);

-- Fills table

CREATE TABLE fills (
  fill_id        SERIAL PRIMARY KEY NOT NULL,
  uid            INTEGER NOT NULL,
  cylinder_id    INTEGER NOT NULL,
  fill_datetime  TIMESTAMP WITH TIME ZONE,
  gas_level_id   INTEGER,
  fill_type      CHARACTER VARYING(12),
  start_pressure INTEGER,
  end_pressure   INTEGER,
  o2_start       INTEGER,
  o2_end         INTEGER,
  he_start       INTEGER,
  he_end         INTEGER,
  o2_vol         INTEGER,
  he_vol         INTEGER,
  counted        BOOLEAN,
  counted_date   TIMESTAMP WITH TIME ZONE
);

ALTER TABLE fills
  OWNER TO kontti;

-- Fill levels

CREATE TABLE fill_level (
  level_id    INTEGER NOT NULL,
  description TEXT
);

ALTER TABLE fill_level
  OWNER TO kontti;

ALTER TABLE ONLY fill_level
  ADD CONSTRAINT fill_level_id_key UNIQUE (level_id);

INSERT INTO fill_level VALUES (10, 'air fill');
INSERT INTO fill_level VALUES (20, 'Nitrox fill');
INSERT INTO fill_level VALUES (30, 'O2 fill');
INSERT INTO fill_level VALUES (40, 'Trimix fill');

-- Gas level

CREATE TABLE gas_level (
  gas_id         INTEGER NOT NULL,
  min_fill_level INTEGER NOT NULL,
  gas_key        CHARACTER VARYING(12)
);

ALTER TABLE gas_level
  OWNER TO kontti;

ALTER TABLE ONLY gas_level
  ADD CONSTRAINT gas_level_id_key UNIQUE (gas_id);

INSERT INTO gas_level VALUES (10, 10, 'air');
INSERT INTO gas_level VALUES (20, 20, 'nx');
INSERT INTO gas_level VALUES (30, 30, 'o2');
INSERT INTO gas_level VALUES (40, 40, 'tx');

-- Log/audit

CREATE TABLE audit (
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  uid        INTEGER                  NOT NULL,
  address    TEXT,
  type       CHARACTER VARYING(16),
  event      TEXT
);

ALTER TABLE audit OWNER TO kontti;

-- Cylinders

CREATE TABLE cylinders
(
  cylinder_id SERIAL PRIMARY KEY NOT NULL,
  user_id INT NOT NULL,
  type_id INT NOT NULL,
  name VARCHAR(128) NOT NULL,
  identifier VARCHAR(128) NOT NULL,
  added TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX cylinders_identifier_uindex ON public.cylinders (identifier);
COMMENT ON TABLE cylinders IS 'list of cylinders that each user has';

ALTER TABLE cylinders OWNER TO kontti;

-- Cylinder types

CREATE TABLE cylinder_types
(
  type_id SERIAL PRIMARY KEY NOT NULL,
  label VARCHAR(128) NOT NULL,
  name VARCHAR(128) NOT NULL,
  pressure INT NOT NULL,
  size FLOAT NOT NULL,
  added TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX cylinder_types_size_idx ON cylinder_types (name);
CREATE UNIQUE INDEX cylinder_types_label_idx ON cylinder_types (label);
COMMENT ON TABLE cylinder_types IS 'list of different types of cylinders';

ALTER TABLE cylinder_types OWNER TO kontti;

-- 200bar
INSERT INTO cylinder_types VALUES ( 1,'40cf-200','40cf/5.7l-200', 200, 5.7, NOW());
INSERT INTO cylinder_types VALUES ( 2,'80cf-200','80cf/11.1l-200', 200, 11.1, NOW());
INSERT INTO cylinder_types VALUES ( 3,'2l-200','2l-200', 200, 2.0, NOW());
INSERT INTO cylinder_types VALUES ( 4,'3l-200','3l-200', 200, 3.0, NOW());
INSERT INTO cylinder_types VALUES ( 5,'4l-200','4l-200', 200, 4.0, NOW());
INSERT INTO cylinder_types VALUES ( 6,'5l-200','5l-200', 200, 5.0, NOW());
INSERT INTO cylinder_types VALUES ( 7,'6l-200','6l-200', 200, 6.0, NOW());
INSERT INTO cylinder_types VALUES ( 8,'7l-200','7l-200', 200, 7.0, NOW());
INSERT INTO cylinder_types VALUES ( 9,'8l-200','8l-200', 200, 8.0, NOW());
INSERT INTO cylinder_types VALUES (10,'9l-200','9l-200', 200, 9.0, NOW());
INSERT INTO cylinder_types VALUES (11,'10l-200','10l-200', 200, 10.0, NOW());
INSERT INTO cylinder_types VALUES (12,'12l-200','12l-200', 200, 12.0, NOW());
INSERT INTO cylinder_types VALUES (13,'15l-200','15l-200', 200, 15.0, NOW());
INSERT INTO cylinder_types VALUES (14,'16l-200','16l-200', 200, 16.0, NOW());
INSERT INTO cylinder_types VALUES (15,'18l-200','18l-200', 200, 18.0, NOW());
INSERT INTO cylinder_types VALUES (16,'20l-200','20l-200', 200, 20.0, NOW());
INSERT INTO cylinder_types VALUES (17,'0.5l-200','0.5l-200', 200, 0.5, NOW());
INSERT INTO cylinder_types VALUES (18,'1.5l-200','1.5l-200', 200, 1.5, NOW());
INSERT INTO cylinder_types VALUES (19,'2.5l-200','2.5l-200', 200, 2.5, NOW());
INSERT INTO cylinder_types VALUES (20,'3.5l-200','3.5l-200', 200, 3.5, NOW());
INSERT INTO cylinder_types VALUES (21,'4.5l-200','4.5l-200', 200, 4.5, NOW());
INSERT INTO cylinder_types VALUES (22,'5.5l-200','5.5l-200', 200, 5.5, NOW());
INSERT INTO cylinder_types VALUES (23,'6.5l-200','6.5l-200', 200, 6.5, NOW());
INSERT INTO cylinder_types VALUES (24,'7.5l-200','7.5l-200', 200, 7.5, NOW());
INSERT INTO cylinder_types VALUES (25,'8.5l-200','8.5l-200', 200, 8.5, NOW());
INSERT INTO cylinder_types VALUES (26,'9.5l-200','9.5l-200', 200, 9.5, NOW());
INSERT INTO cylinder_types VALUES (27,'D5-200','D5-200', 200, 10.0, NOW());
INSERT INTO cylinder_types VALUES (28,'D6-200','D6-200', 200, 12.0, NOW());
INSERT INTO cylinder_types VALUES (29,'D7-200','D7-200', 200, 14.0, NOW());
INSERT INTO cylinder_types VALUES (30,'D8-200','D8-200', 200, 16.0, NOW());
INSERT INTO cylinder_types VALUES (31,'D9-200','D9-200', 200, 18.0, NOW());
INSERT INTO cylinder_types VALUES (32,'D10-200','D10-200', 200, 20.0, NOW());
INSERT INTO cylinder_types VALUES (33,'D12-200','D12-200', 200, 24.0, NOW());
INSERT INTO cylinder_types VALUES (34,'D15-200','D15-200', 200, 30.0, NOW());
INSERT INTO cylinder_types VALUES (35,'D18-200','D18-200', 200, 36.0, NOW());
INSERT INTO cylinder_types VALUES (36,'D20-200','D20-200', 200, 40.0, NOW());
INSERT INTO cylinder_types VALUES (37,'40l-200','40l-200', 200, 40.0, NOW());
INSERT INTO cylinder_types VALUES (38,'50l-200','50l-200', 200, 50.0, NOW());
INSERT INTO cylinder_types VALUES (39,'80l-200','80l-200', 200, 80.0, NOW());
-- 232bar
INSERT INTO cylinder_types VALUES (101,'40cf-232','40cf/5.7l-232', 232, 5.7, NOW());
INSERT INTO cylinder_types VALUES (102,'80cf-232','80cf/11.1l-232', 232, 11.1, NOW());
INSERT INTO cylinder_types VALUES (103,'2l-232','2l-232', 232, 2.0, NOW());
INSERT INTO cylinder_types VALUES (104,'3l-232','3l-232', 232, 3.0, NOW());
INSERT INTO cylinder_types VALUES (105,'4l-232','4l-232', 232, 4.0, NOW());
INSERT INTO cylinder_types VALUES (106,'5l-232','5l-232', 232, 5.0, NOW());
INSERT INTO cylinder_types VALUES (107,'6l-232','6l-232', 232, 6.0, NOW());
INSERT INTO cylinder_types VALUES (108,'7l-232','7l-232', 232, 7.0, NOW());
INSERT INTO cylinder_types VALUES (109,'8l-232','8l-232', 232, 8.0, NOW());
INSERT INTO cylinder_types VALUES (110,'9l-232','9l-232', 232, 9.0, NOW());
INSERT INTO cylinder_types VALUES (111,'10l-232','10l-232', 232, 10.0, NOW());
INSERT INTO cylinder_types VALUES (112,'12l-232','12l-232', 232, 12.0, NOW());
INSERT INTO cylinder_types VALUES (113,'15l-232','15l-232', 232, 15.0, NOW());
INSERT INTO cylinder_types VALUES (114,'16l-232','16l-232', 232, 16.0, NOW());
INSERT INTO cylinder_types VALUES (115,'18l-232','18l-232', 232, 18.0, NOW());
INSERT INTO cylinder_types VALUES (116,'20l-232','20l-232', 232, 20.0, NOW());
INSERT INTO cylinder_types VALUES (117,'0.5l-232','0.5l-232', 232, 0.5, NOW());
INSERT INTO cylinder_types VALUES (118,'1.5l-232','1.5l-232', 232, 1.5, NOW());
INSERT INTO cylinder_types VALUES (119,'2.5l-232','2.5l-232', 232, 2.5, NOW());
INSERT INTO cylinder_types VALUES (120,'3.5l-232','3.5l-232', 232, 3.5, NOW());
INSERT INTO cylinder_types VALUES (121,'4.5l-232','4.5l-232', 232, 4.5, NOW());
INSERT INTO cylinder_types VALUES (122,'5.5l-232','5.5l-232', 232, 5.5, NOW());
INSERT INTO cylinder_types VALUES (123,'6.5l-232','6.5l-232', 232, 6.5, NOW());
INSERT INTO cylinder_types VALUES (124,'7.5l-232','7.5l-232', 232, 7.5, NOW());
INSERT INTO cylinder_types VALUES (125,'8.5l-232','8.5l-232', 232, 8.5, NOW());
INSERT INTO cylinder_types VALUES (126,'9.5l-232','9.5l-232', 232, 9.5, NOW());
INSERT INTO cylinder_types VALUES (127,'D5-232','D5-232', 232, 10.0, NOW());
INSERT INTO cylinder_types VALUES (128,'D6-232','D6-232', 232, 12.0, NOW());
INSERT INTO cylinder_types VALUES (129,'D7-232','D7-232', 232, 14.0, NOW());
INSERT INTO cylinder_types VALUES (130,'D8-232','D8-232', 232, 16.0, NOW());
INSERT INTO cylinder_types VALUES (131,'D9-232','D9-232', 232, 18.0, NOW());
INSERT INTO cylinder_types VALUES (132,'D10-232','D10-232', 232, 20.0, NOW());
INSERT INTO cylinder_types VALUES (133,'D12-232','D12-232', 232, 24.0, NOW());
INSERT INTO cylinder_types VALUES (134,'D15-232','D15-232', 232, 30.0, NOW());
INSERT INTO cylinder_types VALUES (135,'D18-232','D18-232', 232, 36.0, NOW());
INSERT INTO cylinder_types VALUES (136,'D20-232','D20-232', 232, 40.0, NOW());
INSERT INTO cylinder_types VALUES (137,'40l-232','40l-232', 232, 40.0, NOW());
INSERT INTO cylinder_types VALUES (138,'50l-232','50l-232', 232, 50.0, NOW());
INSERT INTO cylinder_types VALUES (139,'80l-232','80l-232', 232, 80.0, NOW());
-- 300bar
INSERT INTO cylinder_types VALUES (201,'40cf-300','40cf/5.7l-300', 300, 5.7, NOW());
INSERT INTO cylinder_types VALUES (202,'80cf-300','80cf/11.1l-300', 300, 11.1, NOW());
INSERT INTO cylinder_types VALUES (203,'2l-300','2l-300', 300, 2.0, NOW());
INSERT INTO cylinder_types VALUES (204,'3l-300','3l-300', 300, 3.0, NOW());
INSERT INTO cylinder_types VALUES (205,'4l-300','4l-300', 300, 4.0, NOW());
INSERT INTO cylinder_types VALUES (206,'5l-300','5l-300', 300, 5.0, NOW());
INSERT INTO cylinder_types VALUES (207,'6l-300','6l-300', 300, 6.0, NOW());
INSERT INTO cylinder_types VALUES (208,'7l-300','7l-300', 300, 7.0, NOW());
INSERT INTO cylinder_types VALUES (209,'8l-300','8l-300', 300, 8.0, NOW());
INSERT INTO cylinder_types VALUES (210,'9l-300','9l-300', 300, 9.0, NOW());
INSERT INTO cylinder_types VALUES (211,'10l-300','10l-300', 300, 10.0, NOW());
INSERT INTO cylinder_types VALUES (212,'12l-300','12l-300', 300, 12.0, NOW());
INSERT INTO cylinder_types VALUES (213,'15l-300','15l-300', 300, 15.0, NOW());
INSERT INTO cylinder_types VALUES (214,'16l-300','16l-300', 300, 16.0, NOW());
INSERT INTO cylinder_types VALUES (215,'18l-300','18l-300', 300, 18.0, NOW());
INSERT INTO cylinder_types VALUES (216,'20l-300','20l-300', 300, 20.0, NOW());
INSERT INTO cylinder_types VALUES (217,'0.5l-300','0.5l-300', 300, 0.5, NOW());
INSERT INTO cylinder_types VALUES (218,'1.5l-300','1.5l-300', 300, 1.5, NOW());
INSERT INTO cylinder_types VALUES (219,'2.5l-300','2.5l-300', 300, 2.5, NOW());
INSERT INTO cylinder_types VALUES (220,'3.5l-300','3.5l-300', 300, 3.5, NOW());
INSERT INTO cylinder_types VALUES (221,'4.5l-300','4.5l-300', 300, 4.5, NOW());
INSERT INTO cylinder_types VALUES (222,'5.5l-300','5.5l-300', 300, 5.5, NOW());
INSERT INTO cylinder_types VALUES (223,'6.5l-300','6.5l-300', 300, 6.5, NOW());
INSERT INTO cylinder_types VALUES (224,'7.5l-300','7.5l-300', 300, 7.5, NOW());
INSERT INTO cylinder_types VALUES (225,'8.5l-300','8.5l-300', 300, 8.5, NOW());
INSERT INTO cylinder_types VALUES (226,'9.5l-300','9.5l-300', 300, 9.5, NOW());
INSERT INTO cylinder_types VALUES (227,'D5-300','D5-300', 300, 10.0, NOW());
INSERT INTO cylinder_types VALUES (228,'D6-300','D6-300', 300, 12.0, NOW());
INSERT INTO cylinder_types VALUES (229,'D7-300','D7-300', 300, 14.0, NOW());
INSERT INTO cylinder_types VALUES (230,'D8-300','D8-300', 300, 16.0, NOW());
INSERT INTO cylinder_types VALUES (231,'D9-300','D9-300', 300, 18.0, NOW());
INSERT INTO cylinder_types VALUES (300,'D10-300','D10-300', 300, 20.0, NOW());
INSERT INTO cylinder_types VALUES (233,'D12-300','D12-300', 300, 24.0, NOW());
INSERT INTO cylinder_types VALUES (234,'D15-300','D15-300', 300, 30.0, NOW());
INSERT INTO cylinder_types VALUES (235,'D18-300','D18-300', 300, 36.0, NOW());
INSERT INTO cylinder_types VALUES (236,'D20-300','D20-300', 300, 40.0, NOW());
INSERT INTO cylinder_types VALUES (237,'40l-300','40l-300', 300, 40.0, NOW());
INSERT INTO cylinder_types VALUES (238,'50l-300','50l-300', 300, 50.0, NOW());
INSERT INTO cylinder_types VALUES (239,'80l-300','80l-300', 300, 80.0, NOW());

-- Certificates

CREATE TABLE certificates
(
  cert_id SERIAL PRIMARY KEY NOT NULL,
  user_id INT NOT NULL,
  org_id INT NOT NULL,
  type VARCHAR(128) NOT NULL,
  instructor VARCHAR(128) NOT NULL,
  name VARCHAR(128) NOT NULL,
  serial_ident VARCHAR(128) NOT NULL,
  added TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX certificates_serial_ident_idx ON certificates (serial_ident);
COMMENT ON TABLE certificates IS 'List of certificates each user has';

ALTER TABLE cylinder_types OWNER TO kontti;

-- Certification organizations
CREATE TABLE certification_org
(
  org_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(128) NOT NULL,
  added TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX cert_org_idx ON certification_org (name);
COMMENT ON TABLE certification_org IS 'list of certification organizations';

ALTER TABLE certification_org OWNER TO kontti;

INSERT INTO certification_org (name, added) VALUES
  ('BSAC', NOW()),
  ('CMAS', NOW()),
  ('GUE', NOW()),
  ('IANTD', NOW()),
  ('IART', NOW()),
  ('NACD', NOW()),
  ('NAUI', NOW()),
  ('PADI', NOW()),
  ('RESA', NOW()),
  ('SDI', NOW()),
  ('SSI', NOW()),
  ('TDI', NOW()),
  ('UTD', NOW());
