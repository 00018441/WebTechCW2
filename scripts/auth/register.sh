#!/usr/bin/env bash

url="http://localhost:6969"
route="/api/auth/register"

res=$(
    curl -s --location "$url$route" \
    --write-out "%{http_code}" \
    --include \
    --verbose \
    --request POST \
    --header 'Content-Type: application/json' \
    --header 'Cache-Control: no-cache' \
    --header 'Connection: keep-alive' \
    --header 'Accept-Language: en' \
    --data-raw '{
        "username": "primeagen",
        "email": "primeagen@aol.com",
        "password": "donthackme"
    }' \
)
clear
echo "$res" | sed '/^{/,$d' | sed -n p
echo "$res" | sed -n '/^{/,$p' | jq .

