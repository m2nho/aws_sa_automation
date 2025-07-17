import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types';

export class EBSEncryptionCheck extends BaseCheck {
  checkId = 'ec2-ebs-encryption';
  checkName = 'EBS 볼륨 암호화 검사';
  category = 'security';
  severity = 'HIGH' as const;

  async execute(volumes: any[]): Promise<TrustAdvisorCheck[]> {
    const results: TrustAdvisorCheck[] = [];

    if (volumes.length === 0) {
      results.push(this.createCheck(
        'ec2-no-volumes',
        'EBS 볼륨 없음',
        'ok',
        'EBS 볼륨이 없습니다.',
        []
      ));
      return results;
    }

    for (const volume of volumes) {
      const volumeName = volume.Tags?.find((tag: any) => tag.Key === 'Name')?.Value || volume.VolumeId;
      
      if (!volume.Encrypted) {
        results.push(this.createCheck(
          `volume-${volume.VolumeId}`,
          `EBS 볼륨: ${volumeName}`,
          'error',
          `암호화되지 않았습니다. (${volume.Size}GB)`,
          [volumeName]
        ));
      } else {
        results.push(this.createCheck(
          `volume-${volume.VolumeId}`,
          `EBS 볼륨: ${volumeName}`,
          'ok',
          `암호화되어 있습니다. (${volume.Size}GB)`,
          [volumeName]
        ));
      }
    }

    return results;
  }
}