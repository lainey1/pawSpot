// backend/app.js

const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const reviewImagesRouter = require("./routes/api/review-images");

const { environment } = require("./config");
const isProduction = environment === "production";

//* Initialize the Express application:
const app = express();

//* Import Routes
const routes = require("./routes");

//* Import Sequelizer validation errors
const { ValidationError } = require("sequelize");

//* Connect the `morgan` middleware for logging information about requests and responses:
app.use(morgan("dev"));

//* Add the `cookie-parser` middleware for parsing cookies and the `express.json` middleware for parsing JSON bodies of requests with `Content-Type` of `"application/json"`.
app.use(cookieParser());
app.use(express.json());

//* Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

//* Add routes to the Express application by importing with the other imports

app.use(routes); // Connect all the routes
app.use("/api/review-images", reviewImagesRouter);

//* Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

//* Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = "Validation error";
    err.errors = errors;
  }
  next(err);
});

//* Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);

  if (!isProduction) {
    // enable cors only in development
    res.json({
      title: err.title || "Server Error",
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    });
  } else {
    res.json({
      title: err.title || "Server Error",
      message: err.message,
      errors: err.errors,
    });
  }
});

// ***** EXPORTS *****/
module.exports = app;
