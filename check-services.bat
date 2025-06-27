@echo off
echo 🔍 檢查CarbonLens服務狀態...
echo.

echo 檢查端口使用情況:
netstat -an | findstr ":3000 :3001 :8090"
echo.

echo 測試後端API連接:
curl -s http://localhost:3001/health
echo.

echo 測試Web前端:
curl -s -o nul -w "Web前端狀態碼: %%{http_code}" http://localhost:3000
echo.

echo 測試工具服務器:
curl -s http://localhost:8090/health
echo.

echo ✅ 檢查完成！
echo.
echo 如果所有服務都正常，您可以：
echo 1. 訪問測試工具: http://localhost:8090/test
echo 2. 訪問Web前端: http://localhost:3000
echo 3. 查看測試指南: http://localhost:8090/guide
echo.
pause 