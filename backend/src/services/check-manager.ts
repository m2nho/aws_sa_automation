import { EC2ClientService } from './aws/ec2-client';
import { TrustAdvisorCheck, CheckRequest, ServiceCheckResult } from '../types/checks';
import { CHECK_CLASSES, getAvailableChecks } from './checks/check-registry';

export class CheckManager {
  private ec2Service: EC2ClientService | null = null;

  private getEC2Service() {
    if (!this.ec2Service) {
      this.ec2Service = new EC2ClientService();
    }
    return this.ec2service;
  }

  async assumeRole(roleArn: string, sessionName: string) {
    return await this.getEC2Service().assumeRole({ roleArn, sessionName });
  }

  async performChecks(request: CheckRequest, credentials: any, region: string): Promise<ServiceCheckResult[]> {
    const results: ServiceCheckResult[] = [];

    for (const serviceRequest of request.services) {
      if (serviceRequest.serviceName === 'ec2') {
        const ec2Results = await this.performEC2Checks(serviceRequest.checks, credentials, region);
        results.push({
          serviceName: 'ec2',
          checks: ec2Results
        });
      }
      // 다른 서비스들도 여기에 추가 가능
    }

    return results;
  }

  private async performEC2Checks(checkIds: string[], credentials: any, region: string): Promise<TrustAdvisorCheck[]> {
    console.log('Performing EC2 checks:', checkIds);
    
    const ec2Service = this.getEC2Service();
    const ec2Client = ec2Service.createEC2Client(credentials, region);
    
    try {
      // 필요한 리소스만 수집
      const resourcesNeeded = this.getRequiredResources(checkIds);
      const resources: any = {};

      if (resourcesNeeded.securityGroups) {
        resources.securityGroups = await ec2Service.getSecurityGroups(ec2Client);
      }
      if (resourcesNeeded.instances) {
        resources.instances = await ec2Service.getInstances(ec2Client);
      }
      if (resourcesNeeded.volumes) {
        resources.volumes = await ec2Service.getVolumes(ec2Client);
      }

      // 선택된 검사만 실행
      const results: TrustAdvisorCheck[] = [];
      for (const checkId of checkIds) {
        const CheckClass = CHECK_CLASSES[checkId as keyof typeof CHECK_CLASSES];
        if (CheckClass) {
          const checkInstance = new CheckClass();
          const checkResults = await this.executeCheck(checkInstance, checkId, resources);
          results.push(...checkResults);
        }
      }

      return results;
    } catch (error) {
      console.error('EC2 checks failed:', error);
      throw error;
    }
  }

  private getRequiredResources(checkIds: string[]) {
    return {
      securityGroups: checkIds.includes('ec2-security-group'),
      instances: checkIds.includes('ec2-public-instance'),
      volumes: checkIds.includes('ec2-ebs-encryption')
    };
  }

  private async executeCheck(checkInstance: any, checkId: string, resources: any): Promise<TrustAdvisorCheck[]> {
    switch (checkId) {
      case 'ec2-security-group':
        return await checkInstance.execute(resources.securityGroups);
      case 'ec2-public-instance':
        return await checkInstance.execute(resources.instances);
      case 'ec2-ebs-encryption':
        return await checkInstance.execute(resources.volumes);
      default:
        return [];
    }
  }

  getAvailableChecks(serviceName?: string) {
    return getAvailableChecks(serviceName);
  }
}