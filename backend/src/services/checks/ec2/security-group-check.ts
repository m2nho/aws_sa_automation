import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types';

export class SecurityGroupCheck extends BaseCheck {
  checkId = 'ec2-security-group';
  checkName = '보안 그룹 설정 검사';
  category = 'security';
  severity = 'HIGH' as const;

  private riskyPorts = [22, 3389, 3306, 5432, 1433, 27017, 6379];

  async execute(securityGroups: any[]): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    for (const sg of securityGroups) {
      const riskyRules = sg.IpPermissions?.filter((rule: any) => 
        rule.IpRanges?.some((ip: any) => ip.CidrIp === '0.0.0.0/0') &&
        this.riskyPorts.includes(rule.FromPort || 0)
      );

      if (riskyRules && riskyRules.length > 0) {
        results.push(this.createCheck(
          `sg-${sg.GroupId}`,
          `보안 그룹: ${sg.GroupName}`,
          'error',
          `위험한 포트가 인터넷(0.0.0.0/0)에 개방되어 있습니다.`,
          [sg.GroupId]
        ));
      }
    }

    return results;
  }
}