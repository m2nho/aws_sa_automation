import { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand, DescribeVolumesCommand } from '@aws-sdk/client-ec2';
import { BaseAWSClient } from './base-client';

export class EC2ClientService extends BaseAWSClient {
  createEC2Client(credentials: any, region: string) {
    return new EC2Client(this.createClientConfig(credentials, region));
  }

  async getSecurityGroups(ec2Client: EC2Client) {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await ec2Client.send(command);
    return response.SecurityGroups || [];
  }

  async getInstances(ec2Client: EC2Client) {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    
    const instances = [];
    for (const reservation of response.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        instances.push(instance);
      }
    }
    return instances;
  }

  async getVolumes(ec2Client: EC2Client) {
    const command = new DescribeVolumesCommand({});
    const response = await ec2Client.send(command);
    return response.Volumes || [];
  }
}