-- kInsertPost

-- $1 - user_id
-- $2 - title
-- $3 - description

INSERT INTO csconfig.posts (
    user_id,
    title,
    description
)
VALUES ($1, $2, $3)
RETURNING id;
