import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.uid }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = await Task.create({ title, dueDate, user: req.user.uid });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - Update a task (Mark as done)
router.put('/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.uid },
      { completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found or user not authorized' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.uid });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or user not authorized' });
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;