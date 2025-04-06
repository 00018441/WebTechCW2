-- kSelectUser

-- $1 - id

SELECT
    id,
    username,
    email,
    status,
    password_hash
FROM csconfig.users
WHERE
    "{{param}}" = $1
    AND removed = FALSE;
