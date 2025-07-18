import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AWS MCP Chatbot
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            사용 가능한 기능
          </h2>
          <ul className="text-blue-800 space-y-1">
            <li>• AWS 문서 및 베스트 프랙티스 검색</li>
            <li>• AWS API 호출 및 리소스 관리</li>
            <li>• Trust Advisor 보안 검사</li>
            <li>• 인프라 코드 생성 및 비용 분석</li>
          </ul>
        </div>

        <ChatInterface />
        
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>예시 질문:</strong>
          </p>
          <ul className="mt-2 space-y-1">
            <li>• "EC2 인스턴스의 보안 그룹 설정을 확인해줘"</li>
            <li>• "S3 버킷 암호화 상태를 검사해줘"</li>
            <li>• "Lambda 함수 런타임 버전을 확인해줘"</li>
            <li>• "CDK로 VPC 생성 코드를 만들어줘"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}