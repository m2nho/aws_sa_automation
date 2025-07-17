import { Router } from 'express';
import { ChecksController } from '../controllers/checks-controller';

const router = Router();
const checksController = new ChecksController();

router.post('/ec2', checksController.performEC2Checks);
router.get('/account-info', checksController.getAccountInfo);

export { router as checksRoutes };