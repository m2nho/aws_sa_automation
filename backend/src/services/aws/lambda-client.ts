import { LambdaClient, ListFunctionsCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';
import { BaseAWSClient } from './base-client';

export class LambdaClientService extends BaseAWSClient {
  createLambdaClient(credentials: any, region: string) {
    return new LambdaClient(this.createClientConfig(credentials, region));
  }

  async getFunctions(lambdaClient: LambdaClient) {
    const command = new ListFunctionsCommand({});
    const response = await lambdaClient.send(command);
    return response.Functions || [];
  }

  async getFunctionDetails(lambdaClient: LambdaClient, functionName: string) {
    const command = new GetFunctionCommand({ FunctionName: functionName });
    const response = await lambdaClient.send(command);
    return response;
  }
}