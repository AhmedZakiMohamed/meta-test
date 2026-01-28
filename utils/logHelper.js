const Log = require("../models/logModel");

const createLog = async ({ user, action, details, ip }) => {
  await Log.create({ user, action, details, ip });
};

module.exports = { createLog };
