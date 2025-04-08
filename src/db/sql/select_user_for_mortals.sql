-- kSelectUserForMortals

-- $1 - id | email

SELECT
    username,
    status,
    created_at
FROM csconfig.users
WHERE
    id = $1
    AND removed = FALSE;
