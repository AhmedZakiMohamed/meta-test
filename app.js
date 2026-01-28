require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const globalErrorHandler = require('./controllers/errorController');
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./utils/dbConnect");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const helmet = require("helmet");
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());



// Routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);




// Rate limiting
const limiter = rateLimit({
  max: 5,                      
  windowMs: 60 * 1000,       
  message: 'Too many requests, please try again in a minute!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);


// Data sanitization and security
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(helmet())

// Global error handling
app.use(globalErrorHandler);
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the app for testing purposes
