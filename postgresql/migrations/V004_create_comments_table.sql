CREATE TABLE IF NOT EXISTS csconfig.comments (
    post_id UUID NOT NULL REFERENCES csconfig.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES csconfig.users(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, post_id)
);
