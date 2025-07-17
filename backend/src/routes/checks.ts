import { Router } from 'express';
import { ChecksController } from '../controllers/checks-controller';

const router = Router();
const checksController = new ChecksController();

router.post('/perform', checksController.performChecks);
router.get('/available', checksController.getAvailableChecks);
router.get('/account-info', checksController.getAccountInfo);

export { router as checksRoutes };