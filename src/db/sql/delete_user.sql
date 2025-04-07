-- kDeleteUser

-- $1 - user_id

UPDATE csconfig.users
SET removed = TRUE
WHERE id = $1;
