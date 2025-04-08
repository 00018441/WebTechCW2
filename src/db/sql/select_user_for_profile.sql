-- kSelectUserForProfile

-- $1 - id | email

SELECT
    id,
    role,
    email,
    status,
    username,
    password_hash
FROM csconfig.users
WHERE
    "{{param}}" = $1
    AND removed = FALSE;
