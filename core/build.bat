@echo off
if not exist build mkdir build
echo Checking for running instances...
taskkill /F /IM simulation.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul
echo Compiling core.cpp...
g++ core.cpp -o build/simulation.exe -lws2_32
if %errorlevel% neq 0 (
    echo Compilation failed!
    exit /b %errorlevel%
)
echo Compilation successful.
