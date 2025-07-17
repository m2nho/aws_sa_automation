import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

export class CognitoAuthService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor(userPoolId: string, clientId: string, region = process.env.AWS_REGION || 'us-east-1') {
    console.log('CognitoAuthService constructor params:', { userPoolId, clientId, region });
    this.client = new CognitoIdentityProviderClient({ region });
    this.userPoolId = userPoolId;
    this.clientId = clientId;
    console.log('CognitoAuthService initialized with clientId:', this.clientId);
  }

  async signIn(username: string, password: string) {
    try {
      console.log('Cognito sign in attempt:', { username, clientId: this.clientId });
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const result = await this.client.send(command);
      console.log('Cognito sign in successful');
      return result;
    } catch (error) {
      console.error('Cognito sign in failed:', error);
      throw error;
    }
  }

  async signUp(username: string, password: string, email: string) {
    const { SignUpCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });

    return await this.client.send(command);
  }

  async confirmSignUp(username: string, confirmationCode: string) {
    const { ConfirmSignUpCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    });

    return await this.client.send(command);
  }

  async refreshToken(refreshToken: string) {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    return await this.client.send(command);
  }
}