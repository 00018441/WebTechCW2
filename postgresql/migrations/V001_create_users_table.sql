CREATE SCHEMA IF NOT EXISTS csconfig;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TYPE IF EXISTS user_status;
CREATE TYPE user_status AS ENUM ('newbie', 'explorer', 'expert');

CREATE TABLE IF NOT EXISTS csconfig.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    removed BOOLEAN NOT NULL DEFAULT FALSE,
    status user_status NOT NULL DEFAULT 'newbie',
    favorites TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
