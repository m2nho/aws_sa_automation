export interface CheckRequest {
  roleArn: string;
  sessionName: string;
  services: ServiceCheckRequest[];
}

export interface ServiceCheckRequest {
  serviceName: 'ec2' | 's3' | 'rds' | 'iam' | 'lambda';
  checks: string[];
}

export interface CheckResponse {
  success: boolean;
  results: ServiceCheckResult[];
  timestamp: string;
}

export interface ServiceCheckResult {
  serviceName: string;
  checks: TrustAdvisorCheck[];
}

export interface TrustAdvisorCheck {
  id: string;
  name: string;
  category: string;
  status: 'ok' | 'warning' | 'error' | 'not_available';
  description: string;
  resources?: any[];
}