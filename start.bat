@echo off
echo =================================
echo   STEAL A SHITCOIN
echo   Pixel Crypto Heist
echo =================================
echo.
echo Starting the game...
echo.

REM Try to start a simple HTTP server
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Found Python! Starting server on http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    start "" "http://localhost:8000"
    python -m http.server 8000
) else (
    where python3 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Found Python3! Starting server on http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo.
        start "" "http://localhost:8000"
        python3 -m http.server 8000
    ) else (
        echo Python not found. Opening game directly in browser...
        echo Note: Some features may not work without a server.
        echo.
        start "" "%~dp0index.html"
    )
)

pause
