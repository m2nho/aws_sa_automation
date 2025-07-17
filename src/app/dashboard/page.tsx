'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const [roleArn, setRoleArn] = useState('');
  const [sessionName, setSessionName] = useState('TrustAdvisorSession');
  const [checks, setChecks] = useState([]);
  const [availableChecks, setAvailableChecks] = useState<{[key: string]: any[]}>({});
  const [selectedServices, setSelectedServices] = useState<string[]>(['ec2']);
  const [selectedChecks, setSelectedChecks] = useState<{[key: string]: string[]}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceAccountId, setServiceAccountId] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/';
    }
    
    // 계정 정보 가져오기
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/checks/account-info`)
      .then(res => res.json())
      .then(data => setServiceAccountId(data.serviceAccountId))
      .catch(() => {});
    
    // 사용 가능한 검사 항목 가져오기
    const services = ['ec2', 'lambda', 's3'];
    const checksData: {[key: string]: any[]} = {};
    const selectedData: {[key: string]: string[]} = {};
    
    Promise.all(
      services.map(service => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/checks/available?service=${service}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              checksData[service] = data.checks;
              selectedData[service] = data.checks.map((check: any) => check.id);
            }
          })
      )
    ).then(() => {
      setAvailableChecks(checksData);
      setSelectedChecks(selectedData);
    });
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setChecks([]);

    try {
      const checkRequest = {
        roleArn,
        sessionName,
        services: selectedServices.map(serviceName => ({
          serviceName: serviceName as any,
          checks: selectedChecks[serviceName] || []
        })).filter(service => service.checks.length > 0)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/checks/perform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkRequest),
      });

      const data = await response.json();
      
      if (data.success) {
        const allChecks = data.results.flatMap((result: any) => result.checks);
        setChecks(allChecks);
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
          <h1 className="text-2xl font-bold text-gray-900">AWS 리소스 검사</h1>
          <p className="text-gray-600 mt-1">AWS 서비스의 리소스 상태를 검사합니다</p>
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
              <p className="text-xs text-gray-500 mt-1">
                예시: arn:aws:iam::123456789012:role/YourRoleName
              </p>
              <p className="text-sm text-gray-500 mt-1">
                고객 계정에서 이 서비스 계정({serviceAccountId})을 신뢰하는 역할의 ARN
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-800">역할 생성 방법:</p>
                <ol className="list-decimal list-inside text-blue-700 mt-1 space-y-1">
                  <li>AWS IAM 콘솔에서 "역할 생성"</li>
                  <li>"다른 AWS 계정" 선택</li>
                  <li>계정 ID: {serviceAccountId}</li>
                  <li>권한: AWSSupportAccess 정책 연결</li>
                  <li>역할 이름: 예) TrustAdvisorRole</li>
                </ol>
              </div>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검사할 서비스 선택
              </label>
              <div className="flex space-x-4 mb-4">
                {['ec2', 'lambda', 's3'].map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service]);
                        } else {
                          setSelectedServices(selectedServices.filter(s => s !== service));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {service.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {selectedServices.map(service => (
              availableChecks[service] && (
                <div key={service} className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {service.toUpperCase()} 검사 항목
                  </h3>
                  <div className="space-y-2">
                    {availableChecks[service].map((check: any) => (
                      <label key={check.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedChecks[service]?.includes(check.id) || false}
                          onChange={(e) => {
                            const serviceChecks = selectedChecks[service] || [];
                            if (e.target.checked) {
                              setSelectedChecks({
                                ...selectedChecks,
                                [service]: [...serviceChecks, check.id]
                              });
                            } else {
                              setSelectedChecks({
                                ...selectedChecks,
                                [service]: serviceChecks.filter(id => id !== check.id)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">{check.name}</span>
                          <p className="text-xs text-gray-500">{check.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              check.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                              check.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {check.severity}
                            </span>
                            <span className="text-xs text-gray-400">{check.category}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading || selectedServices.length === 0 || Object.values(selectedChecks).every(checks => checks.length === 0)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? '검사 중...' : '리소스 검사 시작'}</span>
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
                AWS 리소스 검사 결과
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                총 {checks.length}개의 검사 항목 결과
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