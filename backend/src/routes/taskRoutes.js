const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  syncTasks
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// All task routes are protected
router.use(auth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/sync', syncTasks);

module.exports = router;