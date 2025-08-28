import express from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { upload, createExperiment, listApprovedExperiments, listPendingExperiments, approveExperiment, rejectExperiment, listMyExperiments, getExperimentDetails, joinExperiment, leaveExperiment, listJoinedExperiments, submitDailyData, getDailySubmissionStatus } from "../controllers/experimentController.js";

const router = express.Router();

// public: approved experiments
router.get("/", listApprovedExperiments);
router.get("/mine", requireAuth, listMyExperiments);
router.get("/joined", requireAuth, listJoinedExperiments);
router.get("/:id", getExperimentDetails);

// create experiment (auth required)
router.post("/", requireAuth, upload.single("image"), createExperiment);
router.post("/:id/join", requireAuth, joinExperiment);
router.post("/:id/leave", requireAuth, leaveExperiment);
router.post("/:id/submit", requireAuth, submitDailyData);
router.get("/:id/submission-status", requireAuth, getDailySubmissionStatus);

// admin-only
router.get("/pending", requireAuth, requireAdmin, listPendingExperiments);
router.patch("/:id/approve", requireAuth, requireAdmin, approveExperiment);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectExperiment);

export default router;


