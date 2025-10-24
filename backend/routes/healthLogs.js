import express from "express";
import { check, validationResult } from "express-validator";
import mongoose from "mongoose";
import HealthLog from "../models/HealthLog.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// Helper function to anonymize user data
const anonymizeUserData = (log) => {
  const logObj = log.toObject ? log.toObject() : log;
  if (logObj.user && typeof logObj.user === "object") {
    const { _id, name, email, ...userData } = logObj.user;
    logObj.user = {
      _id: null,
      name: "Anonymous",
      email: "anonymous@example.com",
    };
  }
  return logObj;
};

// @route   POST /api/healthlogs
// @desc    Create a new health log
// @access  Private
router.post("/",
  requireAuth,
  check("symptoms", "At least one symptom is required").isArray({ min: 1 }),
  check("description", "Description is required").not().isEmpty(),
  check("severity", "Valid severity is required").isIn(["mild", "moderate", "severe"]),
  check("shared", "Shared must be a boolean").optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { symptoms, description, severity, location, shared = false } = req.body;

      const newLog = new HealthLog({
        user: req.user.id,
        symptoms: [...new Set(symptoms)],
        description: description.trim(),
        severity,
        location: location ? location.trim() : "",
        shared: Boolean(shared),
        content: description.trim()
      });

      const log = await newLog.save();
      const populatedLog = await HealthLog.findById(log._id).populate("user", ["name", "email"]);
      
      res.status(201).json(populatedLog);
    } catch (err) {
      console.error("Error creating health log:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route   GET /api/healthlogs/me
// @desc    Get logged-in user's health logs
// @access  Private
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await HealthLog.countDocuments({ user: req.user.id });
    const logs = await HealthLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit * 1)
      .populate("user", ["name", "email"]);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalLogs: total,
    });
  } catch (err) {
    console.error("Error fetching user logs:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/healthlogs/community
// @desc    Get all shared health logs (anonymized)
// @access  Public
// @route   GET /api/healthlogs/community
// @desc    Get community health logs (anonymized)
// @access  Public
router.get("/community", async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, location } = req.query;

    const query = { shared: true };

    if (severity) {
      query.severity = { $in: severity.split(",") };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const logs = await HealthLog.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user", ["name", "email"])
      .lean()
      .exec();

    const count = await HealthLog.countDocuments(query);

    // Anonymize user data for community view
    const anonymizedLogs = logs.map((log) => anonymizeUserData(log));

    res.json({
      logs: anonymizedLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalLogs: count,
    });
  } catch (err) {
    console.error("Error fetching community logs:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/healthlogs/stats
// @desc    Get aggregated statistics about health logs
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    // Get most common symptoms (top 10)
    const symptomsStats = await HealthLog.aggregate([
      { $unwind: "$symptoms" },
      { $group: { _id: "$symptoms", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get severity distribution
    const severityStats = await HealthLog.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get most common locations (top 5)
    const locationStats = await HealthLog.aggregate([
      { $match: { location: { $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get logs over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logsOverTime = await HealthLog.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      symptoms: symptomsStats,
      severity: severityStats,
      locations: locationStats,
      logsOverTime: logsOverTime,
    });
  } catch (err) {
    console.error("Error fetching stats:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Export the router
export default router;
