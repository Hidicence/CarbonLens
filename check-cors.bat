@echo off
chcp 65001 >nul
echo 🔄 檢查 CORS 配置...
echo.
echo 📍 測試服務器: http://localhost:8090
echo 🔄 CORS測試頁面: http://localhost:8090/cors
echo 📍 後端API: http://localhost:3001
echo.
echo 正在檢查服務狀態...

netstat -an | findstr :8090 >nul
if %errorlevel%==0 (
    echo ✅ 測試服務器 [8090] - 運行中
) else (
    echo ❌ 測試服務器 [8090] - 未運行
)

netstat -an | findstr :3001 >nul
if %errorlevel%==0 (
    echo ✅ 後端API [3001] - 運行中
) else (
    echo ❌ 後端API [3001] - 未運行
)

echo.
echo 🌐 請在瀏覽器中打開以下URL進行CORS測試:
echo    http://localhost:8090/cors
echo.
echo 📋 如果看到錯誤，請檢查:
echo    1. 後端服務是否重新啟動
echo    2. CORS配置是否正確
echo    3. 瀏覽器控制台錯誤信息
echo.
pause 