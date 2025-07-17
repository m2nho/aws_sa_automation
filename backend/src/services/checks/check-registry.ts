import { SecurityGroupCheck, PublicInstanceCheck, EBSEncryptionCheck } from './ec2';
import { LambdaRuntimeCheck } from './lambda';
import { S3BucketPolicyCheck, S3EncryptionCheck } from './s3';

export interface CheckDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  serviceName: string;
}

export const CHECK_REGISTRY: Record<string, CheckDefinition> = {
  // EC2 검사 항목들
  'ec2-security-group': {
    id: 'ec2-security-group',
    name: '보안 그룹 설정 검사',
    description: '위험한 포트가 인터넷에 개방되어 있는지 검사',
    category: 'security',
    severity: 'HIGH',
    serviceName: 'ec2'
  },
  'ec2-public-instance': {
    id: 'ec2-public-instance',
    name: '퍼블릭 인스턴스 검사',
    description: '불필요한 퍼블릭 IP 할당 검사',
    category: 'security',
    severity: 'MEDIUM',
    serviceName: 'ec2'
  },
  'ec2-ebs-encryption': {
    id: 'ec2-ebs-encryption',
    name: 'EBS 볼륨 암호화 검사',
    description: 'EBS 볼륨 암호화 상태 검사',
    category: 'security',
    severity: 'HIGH',
    serviceName: 'ec2'
  },
  // Lambda 검사 항목들
  'lambda-runtime': {
    id: 'lambda-runtime',
    name: 'Lambda 런타임 버전 검사',
    description: '지원 종료된 런타임 사용 여부 검사',
    category: 'security',
    severity: 'MEDIUM',
    serviceName: 'lambda'
  },
  // S3 검사 항목들
  's3-bucket-policy': {
    id: 's3-bucket-policy',
    name: 'S3 버킷 정책 검사',
    description: '퍼블릭 액세스 허용 여부 검사',
    category: 'security',
    severity: 'HIGH',
    serviceName: 's3'
  },
  's3-encryption': {
    id: 's3-encryption',
    name: 'S3 버킷 암호화 검사',
    description: '버킷 암호화 설정 여부 검사',
    category: 'security',
    severity: 'HIGH',
    serviceName: 's3'
  }
};

export const CHECK_CLASSES = {
  'ec2-security-group': SecurityGroupCheck,
  'ec2-public-instance': PublicInstanceCheck,
  'ec2-ebs-encryption': EBSEncryptionCheck,
  'lambda-runtime': LambdaRuntimeCheck,
  's3-bucket-policy': S3BucketPolicyCheck,
  's3-encryption': S3EncryptionCheck
};

export function getAvailableChecks(serviceName?: string): CheckDefinition[] {
  const checks = Object.values(CHECK_REGISTRY);
  return serviceName ? checks.filter(check => check.serviceName === serviceName) : checks;
}