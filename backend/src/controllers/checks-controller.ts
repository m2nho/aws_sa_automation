import { Request, Response } from 'express';
import { CheckManager } from '../services/check-manager';

export class ChecksController {
  private checkManager: CheckManager | null = null;

  private getCheckManager() {
    if (!this.checkManager) {
      this.checkManager = new CheckManager();
    }
    return this.checkManager;
  }

  performEC2Checks = async (req: Request, res: Response) => {
    try {
      const { roleArn, sessionName } = req.body;
      
      const checkManager = this.getCheckManager();
      const credentials = await checkManager.assumeRole(roleArn, sessionName);
      const checks = await checkManager.performEC2Checks(
        credentials, 
        process.env.AWS_REGION || 'ap-northeast-2'
      );

      res.json({
        success: true,
        checks,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('EC2 checks error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to perform EC2 checks'
      });
    }
  };

  getAccountInfo = async (req: Request, res: Response) => {
    res.json({
      serviceAccountId: process.env.AWS_SERVICE_ACCOUNT_ID,
    });
  };
}