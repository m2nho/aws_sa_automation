import { TrustAdvisorCheck } from '../../types';

export abstract class BaseCheck {
  abstract checkId: string;
  abstract checkName: string;
  abstract category: string;
  abstract severity: 'HIGH' | 'MEDIUM' | 'LOW';

  abstract execute(...args: any[]): Promise<TrustAdvisorCheck[]>;

  protected createCheck(
    id: string,
    name: string,
    status: 'ok' | 'warning' | 'error' | 'not_available',
    description: string,
    resources?: any[]
  ): TrustAdvisorCheck {
    return {
      id,
      name,
      category: this.category,
      status,
      description,
      resources
    };
  }
}