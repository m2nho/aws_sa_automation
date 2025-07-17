'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const [roleArn, setRoleArn] = useState('');
  const [sessionName, setSessionName] = useState('TrustAdvisorSession');
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceAccountId, setServiceAccountId] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/';
    }
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/checks/account-info`)
      .then(res => res.json())
      .then(data => setServiceAccountId(data.serviceAccountId))
      .catch(() => {});
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setChecks([]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/checks/ec2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleArn, sessionName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setChecks(data.checks || []);
      } else {
        setError(data.error || '검사에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security': return 'bg-red-100 text-red-800 border-red-200';
      case 'performance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cost': return 'bg-green-100 text-green-800 border-green-200';
      case 'reliability': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'operational': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return '✓';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'not_available': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'not_available': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AWS 리소스 보안 검사</h1>
          <p className="text-gray-600 mt-1">EC2 인스턴스와 관련 리소스의 보안 상태를 검사합니다</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">AWS 계정 설정</h2>
          </div>
          
          <form onSubmit={handleScan} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role ARN *
              </label>
              <input
                type="text"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="arn:aws:iam::123456789012:role/TrustAdvisorRole"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                고객 계정에서 이 서비스 계정({serviceAccountId})을 신뢰하는 역할의 ARN
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                세션 이름
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? '검사 중...' : 'EC2 보안 검사 시작'}</span>
              </button>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </form>
        </div>

        {checks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                EC2 보안 검사 결과
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                총 {checks.length}개의 검사 항목
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {checks.map((check: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getStatusIcon(check.status)}</span>
                          <h3 className="font-medium text-gray-900">{check.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            getCategoryColor(check.category)
                          }`}>
                            {check.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(check.status)
                          }`}>
                            {check.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}