@echo off
echo Starting BANG! Online Server...
start "BANG! Server" npm run server
timeout /t 2 >nul
echo Starting BANG! Online Client...
start "BANG! Client" npm run dev
echo Done! Both processes are running.
