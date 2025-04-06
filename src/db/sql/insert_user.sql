-- kInsertUser

-- $1 - username
-- $2 - email
-- $3 - password_hash

INSERT INTO csconfig.users (
    username,
    email,
    password_hash
)
VALUES ($1, $2, $3)
RETURNING id;
