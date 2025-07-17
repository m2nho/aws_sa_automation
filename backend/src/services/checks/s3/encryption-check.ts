import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types/checks';

export class S3EncryptionCheck extends BaseCheck {
  checkId = 's3-encryption';
  checkName = 'S3 버킷 암호화 검사';
  category = 'security';
  severity = 'HIGH' as const;

  async execute(buckets: any[], encryptionConfigs: any): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    if (buckets.length === 0) {
      results.push(this.createCheck(
        's3-no-buckets-enc',
        'S3 버킷 없음',
        'ok',
        '계정에 S3 버킷이 없습니다.',
        []
      ));
      return results;
    }

    for (const bucket of buckets) {
      const encryption = encryptionConfigs[bucket.Name!];
      
      if (!encryption) {
        results.push(this.createCheck(
          `s3-enc-${bucket.Name}`,
          `S3 버킷: ${bucket.Name}`,
          'error',
          `암호화되지 않았습니다.`,
          [bucket.Name]
        ));
      } else {
        results.push(this.createCheck(
          `s3-enc-${bucket.Name}`,
          `S3 버킷: ${bucket.Name}`,
          'ok',
          `암호화되어 있습니다.`,
          [bucket.Name]
        ));
      }
    }

    return results;
  }
}