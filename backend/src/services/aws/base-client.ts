import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { AssumeRoleConfig } from '../../types';

export class BaseAWSClient {
  private stsClient: STSClient;

  constructor() {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }
    
    console.log('AWS credentials check:');
    console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
    console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
    
    this.stsClient = new STSClient({ 
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
  }

  async assumeRole(config: AssumeRoleConfig) {
    try {
      // Role ARN 형식 검증
      if (!config.roleArn.includes(':role/')) {
        throw new Error('Invalid Role ARN format. Expected: arn:aws:iam::ACCOUNT-ID:role/ROLE-NAME');
      }
      
      const commandParams: any = {
        RoleArn: config.roleArn,
        RoleSessionName: config.sessionName,
      };
      
      if (config.externalId) {
        commandParams.ExternalId = config.externalId;
      }
      
      console.log('Attempting to assume role:', config.roleArn);
      const command = new AssumeRoleCommand(commandParams);
      const response = await this.stsClient.send(command);
      console.log('Successfully assumed role');
      return response.Credentials;
    } catch (error) {
      console.error('Failed to assume role:', error);
      throw error;
    }
  }

  protected createClientConfig(credentials: any, region: string) {
    return {
      region,
      credentials: {
        accessKeyId: credentials.AccessKeyId!,
        secretAccessKey: credentials.SecretAccessKey!,
        sessionToken: credentials.SessionToken!,
      },
    };
  }
}