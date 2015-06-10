@echo off
set currentPath=%~dp0
set "psStript=powershell -ExecutionPolicy ByPass -File %currentPath%GetRemoteDesktopInfo.ps1"
echo %psStript%
schtasks /create /sc minute /mo 1 /tn "MonitorSetup" /tr "%psStript%"
pause