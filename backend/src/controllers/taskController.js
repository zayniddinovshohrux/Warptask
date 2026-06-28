const Task = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    
    const tasks = await Task.findByUser(req.userId, {
      status,
      priority,
      search,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100)
    });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      throw new AppError('Title is required', 400);
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      status,
      priority,
      dueDate
    });

    logger.info(`Task created: ${task.id} by user ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.update(id, req.userId, {
      title,
      description,
      status,
      priority,
      dueDate
    });

    if (!task) {
      throw new AppError('Task not found or unauthorized', 404);
    }

    logger.info(`Task updated: ${task.id} by user ${req.userId}`);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.delete(id, req.userId);

    if (!task) {
      throw new AppError('Task not found or unauthorized', 404);
    }

    logger.info(`Task deleted: ${task.id} by user ${req.userId}`);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.syncTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      throw new AppError('Tasks array is required', 400);
    }

    const syncedTasks = await Task.sync(req.userId, tasks);

    logger.info(`Synced ${syncedTasks.length} tasks for user ${req.userId}`);

    res.json({
      success: true,
      message: 'Tasks synced successfully',
      count: syncedTasks.length,
      data: syncedTasks
    });
  } catch (error) {
    next(error);
  }
};