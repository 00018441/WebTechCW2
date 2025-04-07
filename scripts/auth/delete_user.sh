#!/usr/bin/env bash

url="http://localhost:6969"
route="/api/users"

res=$(
    curl -s --location "$url$route/asdf" \
    --write-out "%{http_code}" \
    --include \
    --verbose \
    --request DELETE \
    --header 'Content-Type: application/json' \
    --header 'Cache-Control: no-cache' \
    --header 'Connection: keep-alive' \
    --header 'Accept-Language: en' \
)
clear
echo "$res" | sed '/^{/,$d' | sed -n p
echo "$res" | sed -n '/^{/,$p' | jq .

