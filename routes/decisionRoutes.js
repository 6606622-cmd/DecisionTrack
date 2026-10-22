
const express = require("express");

const {
  createDecision,
  getDecisions,
  getDecisionById,
  updateDecision,
  deleteDecision,
  getDecisionHistory,
} = require("../controllers/decisionControllers");

const router = express.Router();

// Create a decision and get all decisions
router.route("/")
  .post(createDecision)
  .get(getDecisions);

// Get decision history
router.get("/:id/history", getDecisionHistory);

// Get, update, or delete one decision
router.route("/:id")
  .get(getDecisionById)
  .put(updateDecision)
  .delete(deleteDecision);

module.exports = router;
