@REM configuration options
@echo off
set dirname=%cd%
title "ssh"
color 0b

echo Checking for Node...

where node.exe >nul 2>&1 && set "node=true" || set "node=false"

if "%node%" == "true" (
    for /F %%F in ('node -v') do echo Node version %%F
) else (
    echo Node not installed, quiting...
    pause
    exit
)

echo Checking for Git

where git.exe  >nul 2>&1 && set "git=true" || set "git=false"

if "%git%" == "true" (
    git -v
) else (
    echo Git not installed, quiting...
    pause
    exit
)
echo Updating to latest git version...

@REM git clone .

echo Finished updating to latest git version.

call npm i

echo {"keys":[]} > ../config.json

SSHClient.cmd