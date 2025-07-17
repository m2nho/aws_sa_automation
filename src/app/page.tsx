'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AWS Trust Advisor
          </h1>
          <p className="text-gray-600">
            AWS 리소스 상태 및 권장사항 검사 서비스
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'login'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'signup'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              회원가입
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
      </div>
    </div>
  );
}