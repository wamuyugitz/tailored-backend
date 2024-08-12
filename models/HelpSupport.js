const mongoose = require("mongoose");

const helpSupportSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  multimedia: { type: String },
});

module.exports = mongoose.model("HelpSupport", helpSupportSchema);
