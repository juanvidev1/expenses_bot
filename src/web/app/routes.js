import { Router } from 'express';
import { HelpController } from './controllers/help.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { ExpensesController } from './controllers/expenses.controller.js';
import { verifyToken } from './middleware/verifyToken.js';

const router = Router();

router.get('/commands', HelpController.commandsList);
router.post('/login', AuthController.createToken);
router.get('/expenses', verifyToken, ExpensesController.getExpenses);

export { router };
