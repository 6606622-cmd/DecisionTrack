
const mongoose = require("mongoose");

const alternativeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    changedBy: {
      type: String,
      default: "system",
    },
    note: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Decision title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Decision description is required"],
      trim: true,
    },
    problem: {
      type: String,
      default: "",
      trim: true,
    },
    alternatives: {
      type: [alternativeSchema],
      default: [],
    },
    selectedOption: {
      type: String,
      default: "",
      trim: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },
    responsiblePerson: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    outcome: {
      type: String,
      enum: [
        "successful",
        "unsuccessful",
        "partially-successful",
        "not-evaluated",
      ],
      default: "not-evaluated",
    },
    outcomeNotes: {
      type: String,
      default: "",
      trim: true,
    },
    history: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Decision", decisionSchema);
