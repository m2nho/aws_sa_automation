import { EC2ClientService } from './aws/ec2-client';
import { LambdaClientService } from './aws/lambda-client';
import { S3ClientService } from './aws/s3-client';
import { TrustAdvisorCheck, CheckRequest, ServiceCheckResult } from '../types/checks';
import { CHECK_CLASSES, getAvailableChecks } from './checks/check-registry';

export class CheckManager {
  private ec2Service: EC2ClientService | null = null;
  private lambdaService: LambdaClientService | null = null;
  private s3Service: S3ClientService | null = null;

  private getEC2Service() {
    if (!this.ec2Service) {
      this.ec2Service = new EC2ClientService();
    }
    return this.ec2Service;
  }

  private getLambdaService() {
    if (!this.lambdaService) {
      this.lambdaService = new LambdaClientService();
    }
    return this.lambdaService;
  }

  private getS3Service() {
    if (!this.s3Service) {
      this.s3Service = new S3ClientService();
    }
    return this.s3Service;
  }

  async assumeRole(roleArn: string, sessionName: string) {
    return await this.getEC2Service().assumeRole({ roleArn, sessionName });
  }

  async performChecks(request: CheckRequest, credentials: any, region: string): Promise<ServiceCheckResult[]> {
    console.log('performChecks called with request:', JSON.stringify(request, null, 2));
    const results: ServiceCheckResult[] = [];

    for (const serviceRequest of request.services) {
      console.log('Processing service:', serviceRequest.serviceName, 'with checks:', serviceRequest.checks);
      
      if (serviceRequest.serviceName === 'ec2') {
        const ec2Results = await this.performEC2Checks(serviceRequest.checks, credentials, region);
        results.push({ serviceName: 'ec2', checks: ec2Results });
      } else if (serviceRequest.serviceName === 'lambda') {
        console.log('Starting Lambda checks...');
        const lambdaResults = await this.performLambdaChecks(serviceRequest.checks, credentials, region);
        results.push({ serviceName: 'lambda', checks: lambdaResults });
      } else if (serviceRequest.serviceName === 's3') {
        console.log('Starting S3 checks...');
        const s3Results = await this.performS3Checks(serviceRequest.checks, credentials, region);
        results.push({ serviceName: 's3', checks: s3Results });
      } else {
        console.log('Unknown service:', serviceRequest.serviceName);
      }
    }

    console.log('Final results:', results.length, 'services processed');
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

  private async performLambdaChecks(checkIds: string[], credentials: any, region: string): Promise<TrustAdvisorCheck[]> {
    console.log('Performing Lambda checks:', checkIds);
    
    const lambdaService = this.getLambdaService();
    const lambdaClient = lambdaService.createLambdaClient(credentials, region);
    
    try {
      const functions = await lambdaService.getFunctions(lambdaClient);
      const results: TrustAdvisorCheck[] = [];
      
      for (const checkId of checkIds) {
        const CheckClass = CHECK_CLASSES[checkId as keyof typeof CHECK_CLASSES];
        if (CheckClass && checkId === 'lambda-runtime') {
          const checkInstance = new CheckClass();
          const checkResults = await (checkInstance as any).execute(functions);
          console.log('Lambda check results:', checkResults);
          results.push(...checkResults);
        }
      }
      
      console.log('Total Lambda results:', results.length);
      return results;
    } catch (error) {
      console.error('Lambda checks failed:', error);
      throw error;
    }
  }

  private async performS3Checks(checkIds: string[], credentials: any, region: string): Promise<TrustAdvisorCheck[]> {
    console.log('Performing S3 checks:', checkIds);
    
    const s3Service = this.getS3Service();
    const s3Client = s3Service.createS3Client(credentials, region);
    
    try {
      const buckets = await s3Service.getBuckets(s3Client);
      const bucketPolicies: any = {};
      const encryptionConfigs: any = {};
      
      // 필요한 데이터만 수집
      if (checkIds.includes('s3-bucket-policy')) {
        for (const bucket of buckets) {
          bucketPolicies[bucket.Name!] = await s3Service.getBucketPolicy(s3Client, bucket.Name!);
        }
      }
      
      if (checkIds.includes('s3-encryption')) {
        for (const bucket of buckets) {
          encryptionConfigs[bucket.Name!] = await s3Service.getBucketEncryption(s3Client, bucket.Name!);
        }
      }
      
      const results: TrustAdvisorCheck[] = [];
      
      for (const checkId of checkIds) {
        const CheckClass = CHECK_CLASSES[checkId as keyof typeof CHECK_CLASSES];
        if (CheckClass) {
          const checkInstance = new CheckClass();
          let checkResults: TrustAdvisorCheck[] = [];
          
          if (checkId === 's3-bucket-policy') {
            checkResults = await (checkInstance as any).execute(buckets, bucketPolicies);
          } else if (checkId === 's3-encryption') {
            checkResults = await (checkInstance as any).execute(buckets, encryptionConfigs);
          }
          
          results.push(...checkResults);
        }
      }
      
      return results;
    } catch (error) {
      console.error('S3 checks failed:', error);
      throw error;
    }
  }

  getAvailableChecks(serviceName?: string) {
    return getAvailableChecks(serviceName);
  }
}