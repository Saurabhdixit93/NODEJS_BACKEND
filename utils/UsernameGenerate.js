const crypto = require("crypto");

const generateRandomString = (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

const generateUsernameFromEmail = (email) => {
  const username = email.split("@")[0];
  const randomSuffix = generateRandomString(4);
  const randomUsername = `${username}${randomSuffix}`;
  return randomUsername;
};

module.exports = { generateUsernameFromEmail };
