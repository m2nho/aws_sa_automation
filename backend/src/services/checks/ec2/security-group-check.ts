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

    if (securityGroups.length === 0) {
      results.push(this.createCheck(
        'ec2-sg-none',
        '보안 그룹 없음',
        'ok',
        '계정에 보안 그룹이 없습니다.',
        []
      ));
      return results;
    }

    for (const sg of securityGroups) {
      const groupName = sg.GroupName || sg.GroupId;
      const riskyRules = sg.IpPermissions?.filter((rule: any) => 
        rule.IpRanges?.some((ip: any) => ip.CidrIp === '0.0.0.0/0') &&
        this.riskyPorts.includes(rule.FromPort || 0)
      );

      if (riskyRules && riskyRules.length > 0) {
        const riskyPorts = riskyRules.map((rule: any) => rule.FromPort).join(', ');
        results.push(this.createCheck(
          `sg-${sg.GroupId}`,
          `보안 그룹: ${groupName}`,
          'error',
          `위험한 포트(${riskyPorts})가 인터넷에 개방되어 있습니다.`,
          [groupName]
        ));
      } else {
        results.push(this.createCheck(
          `sg-${sg.GroupId}`,
          `보안 그룹: ${groupName}`,
          'ok',
          '안전하게 설정되어 있습니다.',
          [groupName]
        ));
      }
    }

    return results;
  }
}