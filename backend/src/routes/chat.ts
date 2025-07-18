import { Router } from 'express';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const router = Router();

const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Debug environment variables
    console.log('Environment variables:');
    console.log('BEDROCK_AGENT_ID:', process.env.BEDROCK_AGENT_ID);
    console.log('BEDROCK_AGENT_ALIAS_ID:', process.env.BEDROCK_AGENT_ALIAS_ID);
    console.log('AWS_REGION:', process.env.AWS_REGION);

    // Check if Bedrock Agent is configured
    if (!process.env.BEDROCK_AGENT_ID || !process.env.BEDROCK_AGENT_ALIAS_ID) {
      console.log('Bedrock Agent not configured, using fallback response');
      const response = generateAwsResponse(message);
      return res.json({
        response,
        sessionId: sessionId || `session-${Date.now()}`,
      });
    }

    console.log('Sending command to Bedrock Agent...');
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID!,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID!,
      sessionId: sessionId || `session-${Date.now()}`,
      inputText: message,
    });

    console.log('Command:', JSON.stringify(command.input, null, 2));
    const response = await client.send(command);
    console.log('Bedrock Agent response received');
    
    let fullResponse = '';
    let chunkCount = 0;
    
    if (response.completion) {
      console.log('Processing completion stream...');
      for await (const chunk of response.completion) {
        chunkCount++;
        console.log(`Processing chunk ${chunkCount}:`, chunk);
        
        if (chunk.chunk?.bytes) {
          const text = new TextDecoder().decode(chunk.chunk.bytes);
          console.log('Decoded text:', text);
          fullResponse += text;
        }
      }
    } else {
      console.log('No completion in response');
    }

    console.log('Final response:', fullResponse);
    console.log('Total chunks processed:', chunkCount);

    res.json({
      response: fullResponse || 'Bedrock Agent에서 응답을 받았지만 내용이 비어있습니다.',
      sessionId: sessionId || `session-${Date.now()}`,
    });

  } catch (error) {
    console.error('Bedrock Agent error:', error);
    const fallbackResponse = generateAwsResponse(req.body.message);
    res.json({
      response: `Bedrock Agent 연결 실패. 기본 응답: ${fallbackResponse}`,
      sessionId: req.body.sessionId || `session-${Date.now()}`,
    });
  }
});

function generateAwsResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('ec2')) {
    return 'EC2 인스턴스 관련 질문입니다. AWS EC2는 확장 가능한 컴퓨팅 용량을 제공합니다. 보안 그룹, 키 페어, AMI 설정을 확인하세요.';
  }
  
  if (lowerMessage.includes('s3')) {
    return 'S3 버킷 관련 질문입니다. S3는 객체 스토리지 서비스입니다. 버킷 정책, 암호화, 버전 관리를 확인하세요.';
  }
  
  if (lowerMessage.includes('lambda')) {
    return 'Lambda 함수 관련 질문입니다. 서버리스 컴퓨팅 서비스입니다. 런타임, 메모리, 타임아웃 설정을 확인하세요.';
  }
  
  if (lowerMessage.includes('trust advisor') || lowerMessage.includes('보안')) {
    return 'Trust Advisor는 AWS 리소스의 보안, 성능, 비용 최적화 권장사항을 제공합니다. 대시보드에서 상세 검사를 실행하세요.';
  }
  
  return 'AWS 관련 질문에 답변드리겠습니다. EC2, S3, Lambda, Trust Advisor 등에 대해 문의하세요.';
}

export default router;