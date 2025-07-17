import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types';

export class PublicInstanceCheck extends BaseCheck {
  checkId = 'ec2-public-instance';
  checkName = '퍼블릭 인스턴스 검사';
  category = 'security';
  severity = 'MEDIUM' as const;

  async execute(instances: any[]): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    for (const instance of instances) {
      if (instance.State?.Name !== 'terminated' && instance.PublicIpAddress) {
        results.push(this.createCheck(
          `instance-${instance.InstanceId}`,
          `퍼블릭 인스턴스: ${instance.InstanceId}`,
          'warning',
          `인스턴스가 퍼블릭 IP를 가지고 있습니다.`,
          [instance.InstanceId]
        ));
      }
    }

    return results;
  }
}