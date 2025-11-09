import { Router } from 'express';
import { HelpController } from './controllers/help.controller.js';

const router = Router();

router.get('/commands', HelpController.commandsList);

export { router };
