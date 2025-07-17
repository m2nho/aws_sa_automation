import { EC2ClientService } from './aws/ec2-client';
import { SecurityGroupCheck, PublicInstanceCheck, EBSEncryptionCheck } from './checks/ec2';
import { TrustAdvisorCheck } from '../types';

export class CheckManager {
  private ec2Service: EC2ClientService | null = null;
  private ec2Checks = [
    new SecurityGroupCheck(),
    new PublicInstanceCheck(),
    new EBSEncryptionCheck()
  ];

  private getEC2Service() {
    if (!this.ec2Service) {
      this.ec2Service = new EC2ClientService();
    }
    return this.ec2Service;
  }

  async assumeRole(roleArn: string, sessionName: string) {
    return await this.getEC2Service().assumeRole({ roleArn, sessionName });
  }

  async performEC2Checks(credentials: any, region: string): Promise<TrustAdvisorCheck[]> {
    console.log('Performing EC2 security checks...');
    
    const ec2Service = this.getEC2Service();
    const ec2Client = ec2Service.createEC2Client(credentials, region);
    
    try {
      // 리소스 수집
      const [securityGroups, instances, volumes] = await Promise.all([
        ec2Service.getSecurityGroups(ec2Client),
        ec2Service.getInstances(ec2Client),
        ec2Service.getVolumes(ec2Client)
      ]);

      // 검사 실행
      const checkResults = await Promise.all([
        this.ec2Checks[0].execute(securityGroups),
        this.ec2Checks[1].execute(instances),
        this.ec2Checks[2].execute(volumes)
      ]);

      return checkResults.flat();
    } catch (error) {
      console.error('EC2 checks failed:', error);
      throw error;
    }
  }
}