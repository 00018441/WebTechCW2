DROP TABLE IF EXISTS csconfig.ratings CASCADE;
CREATE TABLE IF NOT EXISTS csconfig.ratings (
    post_id UUID NOT NULL REFERENCES csconfig.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES csconfig.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, post_id)
);
