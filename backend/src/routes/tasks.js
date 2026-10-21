// Provides authenticated task CRUD endpoints scoped to the signed-in user.
const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
router.use(auth);

function validateTask(body) {
  if (!String(body.title || '').trim()) return 'Task title is required.';
  if (body.priority && !['Low', 'Medium', 'High'].includes(body.priority)) return 'Priority must be Low, Medium, or High.';
  for (const field of ['scheduledAt', 'deadline']) {
    if (body[field] && Number.isNaN(new Date(body[field]).getTime())) return `${field} must be a valid date.`;
  }
  return null;
}

// Whitelists editable task fields so request-only fields cannot be persisted.
function taskFields(body) {
  return {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    scheduledAt: body.scheduledAt || null,
    deadline: body.deadline || null,
    priority: body.priority || 'Medium',
    category: String(body.category || 'Personal').trim() || 'Personal',
  };
}
router.get('/', async (req, res) => {
  try {
    // The authentication middleware supplies the owner ID used for this query.
    const tasks = await Task.find({user: req.userId}).sort({createdAt: -1});
    res.json({tasks});
  } catch (err) { res.status(500).json({message: 'Could not load tasks.'}); }
});
router.post('/', async (req, res) => {
  const error = validateTask(req.body); if (error) return res.status(400).json({message: error});
  try {
    const task = await Task.create({...taskFields(req.body), user: req.userId});
    res.status(201).json({task});
  } catch (err) { res.status(500).json({message: 'Could not create task.'}); }
});
router.put('/:id', async (req, res) => {
  const error = validateTask(req.body); if (error) return res.status(400).json({message: error});
  try {
    // Match both task ID and owner so users cannot edit another account's task.
    const task = await Task.findOneAndUpdate({_id: req.params.id, user: req.userId}, taskFields(req.body), {new: true, runValidators: true});
    if (!task) return res.status(404).json({message: 'Task not found.'});
    res.json({task});
  } catch (err) { res.status(400).json({message: 'Could not update task.'}); }
});
router.patch('/:id/complete', async (req, res) => {
  if (typeof req.body.completed !== 'boolean') return res.status(400).json({message: 'completed must be true or false.'});
  try {
    // Toggle completion independently without replacing the rest of the task.
    const task = await Task.findOneAndUpdate({_id: req.params.id, user: req.userId}, {completed: req.body.completed}, {new: true});
    if (!task) return res.status(404).json({message: 'Task not found.'});
    res.json({task});
  } catch (err) { res.status(400).json({message: 'Could not update task status.'}); }
});
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, user: req.userId});
    if (!task) return res.status(404).json({message: 'Task not found.'});
    res.json({message: 'Task deleted.'});
  } catch (err) { res.status(400).json({message: 'Could not delete task.'}); }
});
module.exports = router;
