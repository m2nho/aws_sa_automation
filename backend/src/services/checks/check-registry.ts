import { SecurityGroupCheck, PublicInstanceCheck, EBSEncryptionCheck } from './ec2';

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
  }
};

export const CHECK_CLASSES = {
  'ec2-security-group': SecurityGroupCheck,
  'ec2-public-instance': PublicInstanceCheck,
  'ec2-ebs-encryption': EBSEncryptionCheck
};

export function getAvailableChecks(serviceName?: string): CheckDefinition[] {
  const checks = Object.values(CHECK_REGISTRY);
  return serviceName ? checks.filter(check => check.serviceName === serviceName) : checks;
}