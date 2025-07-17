import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types/checks';

export class S3BucketPolicyCheck extends BaseCheck {
  checkId = 's3-bucket-policy';
  checkName = 'S3 버킷 정책 검사';
  category = 'security';
  severity = 'HIGH' as const;

  async execute(buckets: any[], bucketPolicies: any): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    if (buckets.length === 0) {
      results.push(this.createCheck(
        's3-no-buckets',
        'S3 버킷 없음',
        'ok',
        '계정에 S3 버킷이 없습니다.',
        []
      ));
      return results;
    }

    for (const bucket of buckets) {
      const policy = bucketPolicies[bucket.Name!];
      
      if (policy && this.hasPublicAccess(policy)) {
        results.push(this.createCheck(
          `s3-${bucket.Name}`,
          `S3 버킷: ${bucket.Name}`,
          'error',
          `퍼블릭 액세스를 허용하고 있습니다.`,
          [bucket.Name]
        ));
      } else {
        results.push(this.createCheck(
          `s3-${bucket.Name}`,
          `S3 버킷: ${bucket.Name}`,
          'ok',
          '안전하게 설정되어 있습니다.',
          [bucket.Name]
        ));
      }
    }

    return results;
  }

  private hasPublicAccess(policy: string): boolean {
    try {
      const policyObj = JSON.parse(policy);
      return policyObj.Statement?.some((stmt: any) => 
        stmt.Principal === '*' || stmt.Principal?.AWS === '*'
      ) || false;
    } catch {
      return false;
    }
  }
}