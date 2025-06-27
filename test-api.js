// API測試腳本 - 驗證CarbonLens後端功能
const baseURL = 'http://localhost:3001/api';

// 測試API連接
async function testConnection() {
    try {
        const response = await fetch(`${baseURL}/projects`);
        console.log('✅ API連接成功，狀態碼:', response.status);
        return true;
    } catch (error) {
        console.error('❌ API連接失敗:', error.message);
        return false;
    }
}

// 測試創建專案
async function testCreateProject() {
    try {
        const projectData = {
            name: '測試同步專案',
            description: '用於測試數據同步的專案',
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            location: '台北市'
        };

        const response = await fetch(`${baseURL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        const result = await response.json();
        console.log('✅ 專案創建成功:', result);
        return result;
    } catch (error) {
        console.error('❌ 專案創建失敗:', error.message);
        return null;
    }
}

// 測試獲取專案列表
async function testGetProjects() {
    try {
        const response = await fetch(`${baseURL}/projects`);
        const projects = await response.json();
        console.log('✅ 獲取專案列表成功，共', projects.length, '個專案');
        projects.forEach(project => {
            console.log(`   - ${project.name} (${project.status})`);
        });
        return projects;
    } catch (error) {
        console.error('❌ 獲取專案列表失敗:', error.message);
        return [];
    }
}

// 測試創建排放記錄
async function testCreateEmission(projectId) {
    try {
        const emissionData = {
            projectId: projectId,
            description: 'API測試排放記錄',
            category: 'transport',
            stage: 'production',
            amount: 100.5,
            date: new Date().toISOString().split('T')[0],
            location: '測試地點'
        };

        const response = await fetch(`${baseURL}/emissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emissionData)
        });

        const result = await response.json();
        console.log('✅ 排放記錄創建成功:', result);
        return result;
    } catch (error) {
        console.error('❌ 排放記錄創建失敗:', error.message);
        return null;
    }
}

// 測試創建營運排放記錄
async function testCreateOperationalEmission() {
    try {
        const emissionData = {
            description: 'API測試營運記錄',
            category: 'electricity',
            amount: 50.25,
            date: new Date().toISOString().split('T')[0]
        };

        const response = await fetch(`${baseURL}/emissions/operational`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emissionData)
        });

        const result = await response.json();
        console.log('✅ 營運排放記錄創建成功:', result);
        return result;
    } catch (error) {
        console.error('❌ 營運排放記錄創建失敗:', error.message);
        return null;
    }
}

// 執行所有測試
async function runAllTests() {
    console.log('🚀 開始API測試...\n');

    // 1. 測試連接
    const connected = await testConnection();
    if (!connected) return;

    // 2. 測試獲取專案
    await testGetProjects();

    // 3. 測試創建專案
    const project = await testCreateProject();
    
    if (project && project.id) {
        // 4. 測試創建專案排放記錄
        await testCreateEmission(project.id);
    }

    // 5. 測試創建營運排放記錄
    await testCreateOperationalEmission();

    // 6. 再次獲取專案列表驗證
    console.log('\n📊 最終專案列表:');
    await testGetProjects();

    console.log('\n🎉 API測試完成！');
}

// 如果直接運行此腳本
if (typeof window === 'undefined') {
    // Node.js環境
    const fetch = require('node-fetch');
    runAllTests();
} else {
    // 瀏覽器環境
    window.runAPITests = runAllTests;
    console.log('在瀏覽器控制台中運行: runAPITests()');
} 