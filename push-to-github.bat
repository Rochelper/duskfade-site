@echo off
chcp 65001 >nul
echo ============================================
echo   Duskfade Site - Push to GitHub (v2)
echo ============================================
echo.

cd /d "C:\Users\admin\WorkBuddy\2026-08-11-09-28-42\duskfade-site"

echo [1/3] Proxy config...
git config --global http.proxy http://127.0.0.1:7892
git config --global https.proxy http://127.0.0.1:7892
echo Proxy: http://127.0.0.1:7892
echo.

echo [2/3] Testing GitHub connection...
git ls-remote origin HEAD 2>&1
echo.

echo [2.5/3] Staging and committing local changes...
git add -A
git commit -m "chore: site update %date% %time%" 2>nul || echo (no new changes to commit)
echo.

echo [3/3] Pushing to GitHub...
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   SUCCESS! Code pushed to GitHub!
    echo   https://github.com/Rochelper/duskfade-site
    echo ============================================
) else (
    echo ============================================
    echo   FAILED! Error code: %ERRORLEVEL%
    echo ============================================
)

echo.
pause