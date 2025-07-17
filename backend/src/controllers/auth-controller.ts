import { Request, Response } from 'express';
import { CognitoAuthService } from '../services/cognito-auth-service';

export class AuthController {
  private cognitoService: CognitoAuthService | null = null;

  private getCognitoService() {
    if (!this.cognitoService) {
      this.cognitoService = new CognitoAuthService(
        process.env.COGNITO_USER_POOL_ID!,
        process.env.COGNITO_CLIENT_ID!
      );
    }
    return this.cognitoService;
  }

  signIn = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt for user:', username);
      const result = await this.getCognitoService().signIn(username, password);
      
      res.json({
        success: true,
        accessToken: result.AuthenticationResult?.AccessToken,
        refreshToken: result.AuthenticationResult?.RefreshToken,
        idToken: result.AuthenticationResult?.IdToken,
      });
    } catch (error: any) {
      console.error('Login error:', error.message);
      res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed'
      });
    }
  };

  signUp = async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      const result = await this.getCognitoService().signUp(username, password, email);
      
      res.json({
        success: true,
        userSub: result.UserSub,
        message: 'User registered successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  };

  confirmSignUp = async (req: Request, res: Response) => {
    try {
      const { username, confirmationCode } = req.body;
      await this.getCognitoService().confirmSignUp(username, confirmationCode);
      
      res.json({
        success: true,
        message: 'Email confirmed successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Confirmation failed'
      });
    }
  };
}