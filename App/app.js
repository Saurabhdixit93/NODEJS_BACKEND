const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const nodemailer = require("nodemailer");
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use("/", require("../routes/index"));

module.exports = app;
