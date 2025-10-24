import Experiment from "../models/experiment.js";
import multer from "multer";
import path from "path";
import Submission from "../models/submission.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";

// Helper function to generate CSV content
const generateCSV = (experiment, submissions) => {
  if (!submissions || submissions.length === 0) return "";

  // Get all unique field names from submissions
  const allFields = new Set();
  submissions.forEach((sub) => {
    Object.keys(sub.data).forEach((key) => allFields.add(key));
  });

  const fields = Array.from(allFields);

  // CSV header
  let csv = "Date," + fields.join(",") + "\n";

  // Add rows
  submissions.forEach((sub) => {
    const date = new Date(sub.date).toISOString().split("T")[0];
    const row = [date];

    fields.forEach((field) => {
      row.push(sub.data[field] !== undefined ? `"${sub.data[field]}"` : "");
    });

    csv += row.join(",") + "\n";
  });

  return csv;
};

// Helper function to generate PDF with enhanced details
const generatePDF = (experiment, submissions, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Add header
  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185);
  doc.text("EXPERIMENT SUMMARY REPORT", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 10;

  // Add title and basic info
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(experiment.title, margin, yPos);
  yPos += 15;

  // Add experiment details section
  doc.setFontSize(12);
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40, "F");

  doc.setFont(undefined, "bold");
  doc.text("Experiment Details", margin + 5, yPos + 8);
  doc.setFont(undefined, "normal");

  const details = [
    `Category: ${experiment.category}`,
    `Status: ${experiment.status}`,
    `Duration: ${experiment.durationDays || "Ongoing"} days`,
    `Created: ${new Date(experiment.createdAt).toLocaleDateString()}`,
    `Participants: ${experiment.participants?.length || 0}`,
    `Total Submissions: ${submissions?.length || 0}`,
  ];

  details.forEach((detail, index) => {
    doc.text(detail, margin + 5, yPos + 18 + index * 5);
  });

  yPos += 50;

  // Add description
  doc.setFont(undefined, "bold");
  doc.text("Description:", margin, yPos);
  doc.setFont(undefined, "normal");
  yPos += 7;

  const description = doc.splitTextToSize(
    experiment.description,
    pageWidth - 2 * margin
  );
  doc.text(description, margin, yPos);
  yPos += description.length * 6 + 15;

  // Add submissions section if available
  if (submissions && submissions.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFont(undefined, "bold");
    doc.setFontSize(16);
    doc.text("Submission Data", margin, yPos);
    yPos += 10;

    // Get all unique field names
    const allFields = new Set();
    submissions.forEach((sub) => {
      Object.keys(sub.data).forEach((key) => allFields.add(key));
    });

    const fields = Array.from(allFields);

    // Group submissions by date
    const submissionsByDate = {};
    submissions.forEach((sub) => {
      const date = new Date(sub.date).toLocaleDateString();
      if (!submissionsByDate[date]) {
        submissionsByDate[date] = [];
      }
      submissionsByDate[date].push(sub);
    });

    // Add a table for each date
    Object.entries(submissionsByDate).forEach(([date, dateSubmissions]) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Add date header
      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text(`Date: ${date}`, margin, yPos);
      yPos += 8;

      // Add table for this date's submissions
      const tableData = dateSubmissions.map((sub, index) => {
        const row = [index + 1]; // Add row number
        fields.forEach((field) => {
          const value = sub.data[field];
          row.push(value !== undefined ? String(value) : "-");
        });
        return row;
      });

      doc.autoTable({
        head: [["#", ...fields]],
        body: tableData,
        startY: yPos,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
          lineWidth: 0.1,
        },
        margin: { top: 5, right: margin, bottom: 10, left: margin },
        tableWidth: "auto",
        columnStyles: {
          0: { cellWidth: 10 }, // Row number column width
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    });
  } else {
    doc.text("No submission data available.", margin, yPos);
    yPos += 10;
  }

  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );

    // Add watermark for draft/confidential if needed
    if (experiment.status === "draft") {
      doc.setFontSize(60);
      doc.setTextColor(230, 230, 230);
      doc.text("DRAFT", pageWidth / 2, doc.internal.pageSize.getHeight() / 2, {
        angle: 45,
        align: "center",
      });
    }
  }

  return doc;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "backend", "uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

export const upload = multer({ storage });

export async function createExperiment(req, res) {
  try {
    const { title, description, category, durationDays } = req.body;
    const formSchema = req.body.formSchema
      ? JSON.parse(req.body.formSchema)
      : [];
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    if (formSchema.length > 10) {
      return res.status(400).json({ message: "Max 10 custom fields" });
    }
    const imageUrl = "/uploads/" + req.file.filename;
    // compute endsAt if durationDays provided
    let duration = undefined;
    let endsAt = undefined;
    if (
      durationDays !== undefined &&
      durationDays !== null &&
      String(durationDays).trim() !== ""
    ) {
      const parsed = Number(durationDays);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return res
          .status(400)
          .json({ message: "durationDays must be a positive number of days" });
      }
      duration = Math.floor(parsed);
      const msPerDay = 24 * 60 * 60 * 1000;
      endsAt = new Date(Date.now() + duration * msPerDay);
    }
    const exp = await Experiment.create({
      title,
      description,
      imageUrl,
      category,
      formSchema,
      createdBy: req.user.id,
      status: "pending",
      durationDays: duration,
      endsAt,
      participants: [],
    });
    res.status(201).json(exp);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create experiment" });
  }
}

export async function listApprovedExperiments(req, res) {
  try {
    const exps = await Experiment.find({ status: "approved" }).sort({
      createdAt: -1,
    });
    // add computed status for convenience
    const now = Date.now();
    const mapped = exps.map((e) => ({
      ...e.toObject(),
      runtimeStatus: e.endsAt
        ? new Date(e.endsAt).getTime() > now
          ? "active"
          : "ended"
        : "active",
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch experiments" });
  }
}

export async function listPendingExperiments(req, res) {
  try {
    console.log("listPendingExperiments called by user:", req.user);
    const exps = await Experiment.find({ status: "pending" })
      .populate("createdBy", "email username")
      .sort({ createdAt: -1 });
    console.log("Found pending experiments:", exps.length);
    res.json(exps);
  } catch (e) {
    console.error("Error in listPendingExperiments:", e);
    res.status(500).json({ message: "Failed to fetch pending" });
  }
}

export async function approveExperiment(req, res) {
  try {
    const { id } = req.params;
    const updated = await Experiment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Failed to approve" });
  }
}

export async function rejectExperiment(req, res) {
  try {
    const { id } = req.params;
    const updated = await Experiment.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Failed to reject" });
  }
}

export async function listMyExperiments(req, res) {
  try {
    const exps = await Experiment.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    const now = Date.now();
    const mapped = exps.map((e) => ({
      ...e.toObject(),
      runtimeStatus: e.endsAt
        ? new Date(e.endsAt).getTime() > now
          ? "active"
          : "ended"
        : "active",
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch your experiments" });
  }
}

export async function getExperimentDetails(req, res) {
  try {
    const { id } = req.params;
    const exp = await Experiment.findById(id);
    if (!exp) return res.status(404).json({ message: "Not found" });
    res.json(exp);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch experiment" });
  }
}

export async function deleteMyExperiment(req, res) {
  try {
    const { id } = req.params;
    const exp = await Experiment.findById(id);
    if (!exp) return res.status(404).json({ message: "Not found" });
    if (String(exp.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await Experiment.findByIdAndDelete(id);
    // Note: We intentionally skip deleting uploads from disk to avoid race conditions.
    await Submission.deleteMany({ experimentId: id }).catch(() => {});
    res.json({ message: "Deleted", id });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete" });
  }
}

export async function joinExperiment(req, res) {
  try {
    const { id } = req.params;
    const exp = await Experiment.findById(id);
    if (!exp) return res.status(404).json({ message: "Not found" });
    // Prevent joining ended experiments when duration provided
    if (exp.endsAt && new Date(exp.endsAt).getTime() <= Date.now()) {
      return res.status(400).json({ message: "Experiment has ended" });
    }
    const userId = req.user.id;
    if (!exp.participants) exp.participants = [];
    if (exp.participants.find((p) => String(p) === String(userId))) {
      return res.status(200).json({ message: "Already joined" });
    }
    exp.participants.push(userId);
    await exp.save();
    res.json({ message: "Joined", experimentId: exp._id });
  } catch (e) {
    res.status(500).json({ message: "Failed to join" });
  }
}

export async function leaveExperiment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const exp = await Experiment.findById(id);
    if (!exp) return res.status(404).json({ message: "Not found" });
    exp.participants = (exp.participants || []).filter(
      (p) => String(p) !== String(userId)
    );
    await exp.save();
    res.json({ message: "Left", experimentId: exp._id });
  } catch (e) {
    res.status(500).json({ message: "Failed to leave" });
  }
}

export async function listJoinedExperiments(req, res) {
  try {
    const userId = req.user.id;
    const exps = await Experiment.find({ participants: userId }).sort({
      createdAt: -1,
    });
    const now = Date.now();
    const mapped = exps.map((e) => ({
      ...e.toObject(),
      runtimeStatus: e.endsAt
        ? new Date(e.endsAt).getTime() > now
          ? "active"
          : "ended"
        : "active",
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch joined experiments" });
  }
}

function getUtcMidnight(date) {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

export async function submitDailyData(req, res) {
  try {
    const { id } = req.params; // experiment id
    const userId = req.user.id;
    const exp = await Experiment.findById(id);
    if (!exp) return res.status(404).json({ message: "Experiment not found" });
    if (!exp.participants?.find((p) => String(p) === String(userId))) {
      return res.status(403).json({ message: "Join experiment first" });
    }
    if (exp.endsAt && new Date(exp.endsAt).getTime() <= Date.now()) {
      return res.status(400).json({ message: "Experiment has ended" });
    }
    const values = req.body?.values || {};
    const today = getUtcMidnight(new Date());
    try {
      const created = await Submission.create({
        experimentId: id,
        userId,
        date: today,
        values,
      });
      return res.status(201).json(created);
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(400).json({ message: "Already submitted for today" });
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to submit data" });
  }
}

export async function getDailySubmissionStatus(req, res) {
  try {
    const { id } = req.params; // experiment id
    const today = getUtcMidnight(new Date());
    const existing = await Submission.findOne({
      experiment: id,
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    res.json({ hasSubmitted: !!existing });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to check submission status" });
  }
}

export async function downloadExperimentSummary(req, res) {
  try {
    const { id } = req.params;
    const { format = "pdf" } = req.query;

    // Get experiment and submissions
    const experiment = await Experiment.findById(id);
    if (!experiment) {
      return res.status(404).json({ message: "Experiment not found" });
    }

    // Check if user is a participant
    if (!experiment.participants.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Not a participant in this experiment" });
    }

    // Get all user's submissions for this experiment
    const submissions = await Submission.find({
      experiment: id,
      user: req.user.id,
    }).sort({ date: 1 });

    // Generate the requested format
    if (format.toLowerCase() === "csv") {
      const csv = generateCSV(experiment, submissions);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="experiment-${experiment._id}-summary.csv"`
      );
      return res.send(csv);
    } else {
      // Default to PDF
      const doc = generatePDF(experiment, submissions, req.user);
      const pdfBuffer = doc.output("arraybuffer");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="experiment-${experiment._id}-summary.pdf"`
      );
      return res.send(Buffer.from(pdfBuffer));
    }
  } catch (error) {
    console.error("Error generating experiment summary:", error);
    res
      .status(500)
      .json({ message: "Failed to generate summary", error: error.message });
  }
}

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total experiments joined
    const totalJoined = await Experiment.countDocuments({
      participants: userId,
      status: 'approved'
    });

    // Get completed experiments (assuming an experiment is completed if it has an end date in the past)
    const completedExperiments = await Experiment.countDocuments({
      participants: userId,
      status: 'approved',
      endDate: { $lt: new Date() }
    });

    // Get total submissions count
    const totalSubmissions = await Submission.countDocuments({
      user: userId
    });

    res.json({
      totalJoined,
      completedExperiments,
      totalSubmissions,
      achievements: 5 // Placeholder for achievements/badges
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

export const getExperimentParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the experiment and populate the participants field with user details
    const experiment = await Experiment.findById(id)
      .populate('participants', 'firstname lastname email profilePicture username')
      .select('participants');
      
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    
    res.json(experiment.participants || []);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all experiments the user has joined
    const experiments = await Experiment.find({
      participants: userId,
      status: 'approved'
    }, '_id title');

    // Get all submissions for the user, grouped by experiment
    const submissionsByExperiment = await Submission.aggregate([
      { $match: { user: userId } },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: "$experiment",
          submissions: {
            $push: {
              id: "$_id",
              date: "$date",
              values: "$data"
            }
          }
        }
      },
      {
        $lookup: {
          from: "experiments",
          localField: "_id",
          foreignField: "_id",
          as: "experiment"
        }
      },
      { $unwind: "$experiment" },
      {
        $project: {
          experimentId: "$_id",
          experimentTitle: "$experiment.title",
          submissions: 1,
          _id: 0
        }
      }
    ]);

    res.json(submissionsByExperiment);
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({ message: "Failed to fetch user submissions" });
  }
};
