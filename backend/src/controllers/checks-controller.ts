import { Request, Response } from 'express';
import { CheckManager } from '../services/check-manager';
import { CheckRequest } from '../types/checks';

export class ChecksController {
  private checkManager: CheckManager | null = null;

  private getCheckManager() {
    if (!this.checkManager) {
      this.checkManager = new CheckManager();
    }
    return this.checkManager;
  }

  performChecks = async (req: Request, res: Response) => {
    try {
      const checkRequest: CheckRequest = req.body;
      console.log('Received check request:', JSON.stringify(checkRequest, null, 2));
      
      const checkManager = this.getCheckManager();
      const credentials = await checkManager.assumeRole(
        checkRequest.roleArn, 
        checkRequest.sessionName
      );
      
      const results = await checkManager.performChecks(
        checkRequest,
        credentials, 
        process.env.AWS_REGION || 'ap-northeast-2'
      );

      res.json({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Checks error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to perform checks'
      });
    }
  };

  getAvailableChecks = async (req: Request, res: Response) => {
    try {
      const { service } = req.query;
      const checkManager = this.getCheckManager();
      const checks = checkManager.getAvailableChecks(service as string);
      
      res.json({
        success: true,
        checks
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get available checks'
      });
    }
  };

  getAccountInfo = async (req: Request, res: Response) => {
    res.json({
      serviceAccountId: process.env.AWS_SERVICE_ACCOUNT_ID,
    });
  };
}