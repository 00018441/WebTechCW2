-- kDeletePost

-- $1 - post_id

DELETE FROM csconfig.posts
WHERE id = $1;
