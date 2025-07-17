#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TrustAdvisorServiceStack } from './cdk-stack';

const app = new cdk.App();
new TrustAdvisorServiceStack(app, 'TrustAdvisorServiceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});