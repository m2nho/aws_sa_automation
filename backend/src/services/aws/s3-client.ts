import { S3Client, ListBucketsCommand, GetBucketPolicyCommand, GetBucketEncryptionCommand } from '@aws-sdk/client-s3';
import { BaseAWSClient } from './base-client';

export class S3ClientService extends BaseAWSClient {
  createS3Client(credentials: any, region: string) {
    return new S3Client(this.createClientConfig(credentials, region));
  }

  async getBuckets(s3Client: S3Client) {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return response.Buckets || [];
  }

  async getBucketPolicy(s3Client: S3Client, bucketName: string) {
    try {
      const command = new GetBucketPolicyCommand({ Bucket: bucketName });
      const response = await s3Client.send(command);
      return response.Policy;
    } catch (error) {
      return null;
    }
  }

  async getBucketEncryption(s3Client: S3Client, bucketName: string) {
    try {
      const command = new GetBucketEncryptionCommand({ Bucket: bucketName });
      const response = await s3Client.send(command);
      return response.ServerSideEncryptionConfiguration;
    } catch (error) {
      return null;
    }
  }
}