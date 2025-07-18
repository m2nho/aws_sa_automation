import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class TrustAdvisorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'TrustAdvisorUserPool', {
      userPoolName: 'trust-advisor-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'TrustAdvisorUserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // IAM Role for Bedrock Agent
    const agentRole = new iam.Role(this, 'BedrockAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'),
      ],
      inlinePolicies: {
        ReadOnlyAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ec2:Describe*',
                's3:List*',
                's3:Get*',
                'lambda:List*',
                'lambda:Get*',
                'iam:List*',
                'iam:Get*',
                'cloudwatch:Get*',
                'cloudwatch:List*',
                'support:Describe*',
                'trustedadvisor:Describe*'
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: [`arn:aws:lambda:${this.region}:${this.account}:function:*MCPServerLambda*`],
            }),
          ],
        }),
      },
    });

    // Lambda function for MCP Server integration (Read-only)
    const mcpLambda = new lambda.Function(this, 'MCPServerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
        const { S3Client, ListBucketsCommand, GetBucketEncryptionCommand } = require('@aws-sdk/client-s3');
        const { LambdaClient, ListFunctionsCommand } = require('@aws-sdk/client-lambda');
        
        exports.handler = async (event) => {
          console.log('🚀 MCP LAMBDA CALLED! Event:', JSON.stringify(event, null, 2));
          console.log('🚀 LAMBDA FUNCTION DEFINITELY INVOKED!');
          
          const { actionGroup, function: functionName, parameters } = event;
          
          try {
            console.log('Processing actionGroup:', actionGroup);
            switch (actionGroup) {
              case 'resourcecheck':
                console.log('🔍 Calling checkResources function');
                return await checkResources(parameters);
              default:
                console.log('❌ Unknown action group:', actionGroup);
                return { error: 'Unknown action group: ' + actionGroup };
            }
          } catch (error) {
            console.log('❌ Lambda error:', error);
            return {
              messageVersion: '1.0',
              response: {
                actionGroup: actionGroup,
                function: functionName,
                functionResponse: {
                  responseBody: {
                    'TEXT': {
                      body: 'Error: ' + error.message
                    }
                  }
                }
              }
            };
          }
        };
        
        async function checkResources(params) {
          console.log('🔍 checkResources function called with params:', params);
          const results = {};
          
          try {
            // EC2 인스턴스 조회
            console.log('📊 Checking EC2 instances...');
            const ec2 = new EC2Client({ region: process.env.AWS_REGION });
            const instances = await ec2.send(new DescribeInstancesCommand({}));
            
            results.ec2Details = [];
            results.ec2Count = 0;
            
            if (instances.Reservations) {
              instances.Reservations.forEach(reservation => {
                reservation.Instances?.forEach(instance => {
                  results.ec2Count++;
                  results.ec2Details.push({
                    id: instance.InstanceId,
                    type: instance.InstanceType,
                    state: instance.State?.Name,
                    az: instance.Placement?.AvailabilityZone
                  });
                });
              });
            }
            
            // S3 버킷 조회
            console.log('📊 Checking S3 buckets...');
            const s3 = new S3Client({ region: process.env.AWS_REGION });
            const buckets = await s3.send(new ListBucketsCommand({}));
            results.s3Count = buckets.Buckets?.length || 0;
            results.s3Details = buckets.Buckets?.map(bucket => ({
              name: bucket.Name,
              created: bucket.CreationDate
            })) || [];
            
            // Lambda 함수 조회
            console.log('📊 Checking Lambda functions...');
            const lambda = new LambdaClient({ region: process.env.AWS_REGION });
            const functions = await lambda.send(new ListFunctionsCommand({}));
            results.lambdaCount = functions.Functions?.length || 0;
            results.lambdaDetails = functions.Functions?.map(func => ({
              name: func.FunctionName,
              runtime: func.Runtime,
              size: func.CodeSize
            })) || [];
            
            console.log('✅ Resource check completed:', results);
            return {
              messageVersion: '1.0',
              response: {
                actionGroup: 'resourcecheck',
                function: 'check_resources',
                functionResponse: {
                  responseBody: {
                    'TEXT': {
                      body: JSON.stringify(results)
                    }
                  }
                }
              }
            };
          } catch (error) {
            console.log('❌ Error in checkResources:', error);
            return {
              messageVersion: '1.0',
              response: {
                actionGroup: 'resourcecheck',
                function: 'check_resources',
                functionResponse: {
                  responseBody: {
                    'TEXT': {
                      body: 'Error: ' + error.message
                    }
                  }
                }
              }
            };
          }
        }
      `),
      timeout: cdk.Duration.minutes(2),
    });

    // Grant Lambda read-only permissions
    mcpLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ec2:Describe*',
        's3:List*',
        's3:Get*',
        'lambda:List*',
        'lambda:Get*'
      ],
      resources: ['*'],
    }));

    // Grant Lambda permissions to Bedrock Agent
    mcpLambda.grantInvoke(agentRole);
    
    // Add resource-based policy for Bedrock service to invoke Lambda
    mcpLambda.addPermission('BedrockInvokePermission', {
      principal: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceAccount: this.account,
    });

    // AWS MCP Agent with Action Groups
    const agent = new bedrock.CfnAgent(this, 'SimpleTestAgent', {
      agentName: 'aws-mcp-agent',
      description: 'AWS 리소스 조회 및 MCP 기능 에이전트',
      foundationModel: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      agentResourceRoleArn: agentRole.roleArn,
      autoPrepare: true,
      instruction: `당신은 AWS 전문 어시스턴트입니다. 다음 기능을 제공합니다:
        - AWS 리소스 현황 조회 (읽기 전용)
        - AWS 베스트 프랙티스 안내
        - 보안 및 비용 최적화 가이드
        
        중요: 리소스 생성/수정/삭제는 절대 수행하지 않습니다.`,
      actionGroups: [
        {
          actionGroupName: 'resourcecheck',
          description: 'AWS 리소스 현황 조회',
          actionGroupExecutor: {
            lambda: mcpLambda.functionArn,
          },
          functionSchema: {
            functions: [
              {
                name: 'check_resources',
                description: 'AWS 리소스 현황을 조회합니다. EC2 인스턴스, S3 버킷, Lambda 함수 등의 정보를 제공합니다.'
              },
            ],
          },
        },
      ],
    });

    // Bedrock Agent Alias
    const agentAlias = new bedrock.CfnAgentAlias(this, 'MCPChatbotAgentAlias', {
      agentId: agent.attrAgentId,
      agentAliasName: 'withaction',
      description: 'Production alias with action groups',
    });

    // Output values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'BedrockAgentId', {
      value: agent.attrAgentId,
      description: 'Bedrock Agent ID',
    });

    new cdk.CfnOutput(this, 'BedrockAgentAliasId', {
      value: agentAlias.attrAgentAliasId,
      description: 'Bedrock Agent Alias ID',
    });

    new cdk.CfnOutput(this, 'MCPLambdaArn', {
      value: mcpLambda.functionArn,
      description: 'MCP Server Lambda Function ARN (Read-only)',
    });


  }
}