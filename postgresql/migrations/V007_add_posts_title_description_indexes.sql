CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DROP INDEX IF EXISTS csconfig.idx_posts_title_trgm;
CREATE INDEX idx_posts_title_trgm ON csconfig.posts USING gin (title gin_trgm_ops);

DROP INDEX IF EXISTS csconfig.idx_posts_description_trgm;
CREATE INDEX idx_posts_description_trgm ON csconfig.posts USING gin (description gin_trgm_ops);
