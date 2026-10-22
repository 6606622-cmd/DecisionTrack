
const mongoose = require("mongoose");
const Decision = require("../models/Decision");

const allowedStatuses = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "in-progress",
  "completed",
  "cancelled",
];

const allowedPriorities = ["low", "medium", "high", "urgent"];

const allowedOutcomes = [
  "successful",
  "unsuccessful",
  "partially-successful",
  "not-evaluated",
];

// CREATE a new decision
const createDecision = async (req, res, next) => {
  try {
    const {
      title,
      description,
      problem,
      alternatives,
      selectedOption,
      reason,
      priority,
      status,
      responsiblePerson,
      deadline,
      outcome,
      outcomeNotes,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required and must be text.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters.",
      });
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${allowedPriorities.join(", ")}`,
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    if (outcome && !allowedOutcomes.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: `Outcome must be one of: ${allowedOutcomes.join(", ")}`,
      });
    }

    if (deadline !== undefined && deadline !== null && deadline !== "") {
      if (
        typeof deadline !== "string" ||
        Number.isNaN(Date.parse(deadline))
      ) {
        return res.status(400).json({
          success: false,
          message: "Deadline must be a valid date.",
        });
      }
    }

    if (alternatives !== undefined && !Array.isArray(alternatives)) {
      return res.status(400).json({
        success: false,
        message: "Alternatives must be an array.",
      });
    }

    if (
      Array.isArray(alternatives) &&
      alternatives.some(
        (item) =>
          !item ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          (item.pros !== undefined &&
            (!Array.isArray(item.pros) ||
              !item.pros.every((value) => typeof value === "string"))) ||
          (item.cons !== undefined &&
            (!Array.isArray(item.cons) ||
              !item.cons.every((value) => typeof value === "string")))
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each alternative needs a name and optional arrays of text values for pros and cons.",
      });
    }

    const decision = await Decision.create({
      title: title.trim(),
      description: description.trim(),
      problem,
      alternatives,
      selectedOption,
      reason,
      priority,
      status,
      responsiblePerson,
      deadline: deadline || null,
      outcome,
      outcomeNotes,
      history: [
        {
          action: "Decision created",
          changedBy: responsiblePerson || "system",
          note: "New decision created",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Decision created successfully",
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

// GET all decisions with search, filters, and pagination
const getDecisions = async (req, res, next) => {
  try {
    const { search, status, priority } = req.query;
    const pageNumber = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNumber = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${allowedPriorities.join(", ")}`,
      });
    }

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { problem: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [decisions, total] = await Promise.all([
      Decision.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Decision.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: decisions.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
      data: decisions,
    });
  } catch (error) {
    next(error);
  }
};

// GET one decision by ID
const getDecisionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision ID.",
      });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        message: "Decision not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE a decision
const updateDecision = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision ID.",
      });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        message: "Decision not found.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "problem",
      "alternatives",
      "selectedOption",
      "reason",
      "priority",
      "status",
      "responsiblePerson",
      "deadline",
      "outcome",
      "outcomeNotes",
    ];

    const updatedFields = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (
          ["title", "description"].includes(field) &&
          (typeof req.body[field] !== "string" ||
            !req.body[field].trim())
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string.`,
          });
        }

        if (
          field === "title" &&
          req.body.title.trim().length > 200
        ) {
          return res.status(400).json({
            success: false,
            message: "Title cannot exceed 200 characters.",
          });
        }

        if (
          field === "priority" &&
          !allowedPriorities.includes(req.body.priority)
        ) {
          return res.status(400).json({
            success: false,
            message: `Priority must be one of: ${allowedPriorities.join(", ")}`,
          });
        }

        if (
          field === "status" &&
          !allowedStatuses.includes(req.body.status)
        ) {
          return res.status(400).json({
            success: false,
            message: `Status must be one of: ${allowedStatuses.join(", ")}`,
          });
        }

        if (
          field === "outcome" &&
          !allowedOutcomes.includes(req.body.outcome)
        ) {
          return res.status(400).json({
            success: false,
            message: `Outcome must be one of: ${allowedOutcomes.join(", ")}`,
          });
        }

        if (
          field === "alternatives" &&
          !Array.isArray(req.body.alternatives)
        ) {
          return res.status(400).json({
            success: false,
            message: "Alternatives must be an array.",
          });
        }

        if (
          field === "alternatives" &&
          req.body.alternatives.some(
            (item) =>
              !item ||
              typeof item.name !== "string" ||
              !item.name.trim() ||
              (item.pros !== undefined &&
                (!Array.isArray(item.pros) ||
                  !item.pros.every((value) => typeof value === "string"))) ||
              (item.cons !== undefined &&
                (!Array.isArray(item.cons) ||
                  !item.cons.every((value) => typeof value === "string")))
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Each alternative needs a name and valid pros/cons arrays.",
          });
        }

        if (field === "deadline") {
          if (
            req.body.deadline !== null &&
            req.body.deadline !== "" &&
            (typeof req.body.deadline !== "string" ||
              Number.isNaN(Date.parse(req.body.deadline)))
          ) {
            return res.status(400).json({
              success: false,
              message: "Deadline must be a valid date or null.",
            });
          }

          decision.deadline =
            req.body.deadline === "" ? null : req.body.deadline;
        } else {
          decision.set(field, req.body[field]);
        }

        updatedFields.push(field);
      }
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    decision.history.push({
      action: "Decision updated",
      changedBy:
        req.body.responsiblePerson ||
        decision.responsiblePerson ||
        "system",
      note: `Updated fields: ${updatedFields.join(", ")}`,
    });

    await decision.save();

    return res.status(200).json({
      success: true,
      message: "Decision updated successfully",
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE a decision
const deleteDecision = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision ID.",
      });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        message: "Decision not found.",
      });
    }

    await decision.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Decision deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// GET decision history
const getDecisionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision ID.",
      });
    }

    const decision = await Decision.findById(id).select("title history");

    if (!decision) {
      return res.status(404).json({
        success: false,
        message: "Decision not found.",
      });
    }

    return res.status(200).json({
      success: true,
      title: decision.title,
      count: decision.history.length,
      data: decision.history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDecision,
  getDecisions,
  getDecisionById,
  updateDecision,
  deleteDecision,
  getDecisionHistory,
};
