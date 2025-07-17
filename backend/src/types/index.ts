export interface AssumeRoleConfig {
  roleArn: string;
  sessionName: string;
  externalId?: string;
}

export interface TrustAdvisorCheck {
  id: string;
  name: string;
  category: string;
  status: 'ok' | 'warning' | 'error' | 'not_available';
  description: string;
  resources?: any[];
}

export interface CheckResult {
  serviceName: string;
  checks: TrustAdvisorCheck[];
  timestamp: string;
}

export interface AuthRequest {
  username: string;
  password: string;
  email?: string;
}