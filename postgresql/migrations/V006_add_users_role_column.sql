DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('mortal', 'admin');

ALTER TABLE csconfig.users ADD COLUMN role user_role NOT NULL DEFAULT 'mortal';
