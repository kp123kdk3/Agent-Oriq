import express from 'express';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/taskController';

const router = express.Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.patch('/:id/assign', taskController.assignTask);
router.get('/:id/history', taskController.getTaskHistory);

export default router;

