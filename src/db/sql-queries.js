export const sqlQueries = {
    "kSelectAllUsers": "SELECT\n    id,\n    username,\n    last_seen\nFROM csconfig.users\nWHERE\n    removed = FALSE;",
    "kUpdateUserLastSeen": "UPDATE csconfig.users\nSET\n    last_seen = NOW(),\n    is_online = FALSE\nWHERE\n    id = $1\nRETURNING username;"
};
