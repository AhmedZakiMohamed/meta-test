const Task = require("../models/taskModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, status } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    owner: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { task },
  });
});

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({ owner: req.user._id });

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: { tasks },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

  if (!task) return next(new AppError("Task not found", 404));

  res.status(200).json({
    status: "success",
    data: { task },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const allowedFields = ["title", "description", "status"];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) updates[key] = req.body[key];
  });

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true },
  );

  if (!task) return next(new AppError("Task not found", 404));

  res.status(200).json({
    status: "success",
    data: { task },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) return next(new AppError("Task not found", 404));

  res.status(204).json({ status: "success", data: null });
});
