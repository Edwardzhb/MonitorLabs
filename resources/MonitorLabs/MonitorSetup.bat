@echo off
set currentPath=%~dp0
set "psStript=powershell -ExecutionPolicy ByPass -File %currentPath%collectLabInfo.ps1"
echo %psStript%
schtasks /create /sc minute /mo 5 /tn "MonitorSetup" /tr "%psStript%"
pause