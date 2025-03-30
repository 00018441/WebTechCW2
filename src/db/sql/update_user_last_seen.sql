UPDATE csconfig.users
SET
    last_seen = NOW(),
    is_online = FALSE
WHERE
    id = $1
RETURNING username;
