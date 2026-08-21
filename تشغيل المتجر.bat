@echo off
cd /d "%~dp0"
echo ============================================
echo    M3DStore - جاري تشغيل المتجر...
echo    بعد التشغيل افتح: http://localhost:3000
echo ============================================
start "" http://localhost:3000
npm run dev
