@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title M3DStore

echo ============================================
echo    M3DStore - تشغيل المتجر
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [خطأ] Node.js غير مثبت على الجهاز.
  echo نزّله من https://nodejs.org ثم شغّل هذا الملف مرة ثانية.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo أول تشغيل - جاري تنصيب المكتبات، انتظر دقيقة...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo [خطأ] فشل تنصيب المكتبات. صوّر الرسالة فوق وأرسلها.
    pause
    exit /b 1
  )
)

echo جاري تشغيل الخادم...
echo.

rem الخادم يشتغل في نافذة مستقلة حتى تبقى هذه النافذة حرة للانتظار
start "M3DStore Server" cmd /c "npm.cmd run dev"

echo انتظر لحظة حتى يجهز الخادم قبل فتح المتصفح...
set /a tries=0

:wait
set /a tries+=1
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "try{ (Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 3) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto ready
if %tries% lss 45 goto wait

echo.
echo [تنبيه] الخادم أخذ وقتًا أطول من المتوقع.
echo راجع نافذة "M3DStore Server" لتشوف الخطأ.
echo.
pause
exit /b 1

:ready
echo.
echo   المتجر جاهز
echo   افتح: http://localhost:3000
echo   لوحة التحكم: http://localhost:3000/admin
echo.
start "" http://localhost:3000

echo لإيقاف المتجر: اقفل نافذة "M3DStore Server".
echo تقدر تقفل هذه النافذة الآن.
echo.
pause
