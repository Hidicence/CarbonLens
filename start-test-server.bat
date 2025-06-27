@echo off
echo 啟動CarbonLens測試服務器...
echo.
echo 服務端口說明:
echo - 後端API: http://localhost:3001
echo - Web前端: http://localhost:3000  
echo - 測試工具: http://localhost:8090
echo.
node simple-server.js
pause 