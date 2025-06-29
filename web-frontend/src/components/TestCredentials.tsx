import React from 'react';
import { Copy, User, Key } from 'lucide-react';

const TestCredentials: React.FC = () => {
  const testCredentials = {
    email: 'demo@carbonlens.com',
    password: 'demo123456'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('已複製到剪貼板');
    });
  };

  return (
    <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
      <h3 className="text-sm font-medium text-purple-200 mb-3 flex items-center">
        <User className="w-4 h-4 mr-2" />
        測試帳號
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">帳號:</span>
            <span className="text-sm text-white font-mono">{testCredentials.email}</span>
          </div>
          <button
            onClick={() => copyToClipboard(testCredentials.email)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">密碼:</span>
            <span className="text-sm text-white font-mono">{testCredentials.password}</span>
          </div>
          <button
            onClick={() => copyToClipboard(testCredentials.password)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        點擊複製按鈕可快速複製帳號密碼
      </p>
    </div>
  );
};

export default TestCredentials; 