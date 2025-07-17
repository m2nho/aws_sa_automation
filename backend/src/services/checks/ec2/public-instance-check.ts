import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types';

export class PublicInstanceCheck extends BaseCheck {
  checkId = 'ec2-public-instance';
  checkName = '퍼블릭 인스턴스 검사';
  category = 'security';
  severity = 'MEDIUM' as const;

  async execute(instances: any[]): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    if (instances.length === 0) {
      results.push(this.createCheck(
        'ec2-no-instances',
        'EC2 인스턴스 없음',
        'ok',
        'EC2 인스턴스가 없습니다.',
        []
      ));
      return results;
    }

    for (const instance of instances) {
      if (instance.State?.Name === 'terminated') continue;
      
      const instanceName = instance.Tags?.find((tag: any) => tag.Key === 'Name')?.Value || instance.InstanceId;
      
      if (instance.PublicIpAddress) {
        results.push(this.createCheck(
          `instance-${instance.InstanceId}`,
          `EC2 인스턴스: ${instanceName}`,
          'warning',
          `퍼블릭 IP(${instance.PublicIpAddress})를 가지고 있습니다.`,
          [instanceName]
        ));
      } else {
        results.push(this.createCheck(
          `instance-${instance.InstanceId}`,
          `EC2 인스턴스: ${instanceName}`,
          'ok',
          '프라이베이트 네트워크에 있습니다.',
          [instanceName]
        ));
      }
    }

    return results;
  }
}