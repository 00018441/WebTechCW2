DROP TYPE IF EXISTS value_type;
CREATE TYPE value_type AS ENUM ('text', 'number', 'boolean', 'dropdown');

CREATE TABLE IF NOT EXISTS csconfig.setting_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS csconfig.post_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES csconfig.posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES csconfig.setting_categories(id) ON DELETE SET NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    value_type value_type NOT NULL DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
