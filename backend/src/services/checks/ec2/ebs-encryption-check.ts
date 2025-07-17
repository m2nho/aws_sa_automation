import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types';

export class EBSEncryptionCheck extends BaseCheck {
  checkId = 'ec2-ebs-encryption';
  checkName = 'EBS 볼륨 암호화 검사';
  category = 'security';
  severity = 'HIGH' as const;

  async execute(volumes: any[]): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    for (const volume of volumes) {
      if (!volume.Encrypted) {
        results.push(this.createCheck(
          `volume-${volume.VolumeId}`,
          `암호화되지 않은 볼륨: ${volume.VolumeId}`,
          'error',
          `EBS 볼륨이 암호화되지 않았습니다.`,
          [volume.VolumeId]
        ));
      }
    }

    return results;
  }
}