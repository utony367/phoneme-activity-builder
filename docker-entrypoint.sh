#!/bin/sh
set -eu

: "${DATABASE_URL:=file:/data/app.db}"
export DATABASE_URL

./node_modules/.bin/prisma migrate deploy
exec node server.js
