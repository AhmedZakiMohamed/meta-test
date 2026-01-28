const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { createLog } = require("../utils/logHelper");
const { body, validationResult } = require("express-validator");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
exports.validateSignup = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  await createLog({
    user: user._id,
    action: "signup",
    details: { email: user.email },
    ip: req.ip,
  });

  res.status(201).json({
    status: "success",
    token,
    data: { user },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    await createLog({
      action: "login-fail",
      details: { email, reason: "Missing email or password" },
      ip: req.ip,
    });
    return next(new AppError("Email and password required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    await createLog({
      action: "login-fail",
      details: { email, reason: "Invalid credentials" },
      ip: req.ip,
    });
    return next(new AppError("Invalid credentials", 401));
  }

  const token = signToken(user._id);

  await createLog({
    user: user._id,
    action: "login-success",
    details: {},
    ip: req.ip,
  });

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    await createLog({
      action: "unauthorized-access",
      details: { attemptedEndpoint: req.originalUrl },
      ip: req.ip,
    });
    return next(new AppError("You are not logged in", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    await createLog({
      action: "unauthorized-access",
      details: { attemptedEndpoint: req.originalUrl },
      ip: req.ip,
    });
    return next(new AppError("User no longer exists", 401));
  }

  req.user = user;
  next();
});
