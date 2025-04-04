CREATE SCHEMA IF NOT EXISTS csconfig;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TYPE IF EXISTS user_status CASCADE;
CREATE TYPE user_status AS ENUM ('newbie', 'explorer', 'expert');

DROP TABLE IF EXISTS csconfig.users CASCADE;
CREATE TABLE IF NOT EXISTS csconfig.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status user_status NOT NULL DEFAULT 'newbie',
    favorites TEXT[] NOT NULL DEFAULT '{}',
    removed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
