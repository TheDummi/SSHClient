echo off
color 0d

if not exist ../config.json (
    setup.cmd
)

call node ../scripts/update.js

cls

call node ../scripts/main.js

exit