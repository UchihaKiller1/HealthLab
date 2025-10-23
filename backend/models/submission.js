import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    experimentId: { type: mongoose.Schema.Types.ObjectId, ref: "Experiment", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Store normalized date (midnight UTC) to enforce one submission per day
    date: { type: Date, required: true, index: true },
    values: { type: Object, default: {} }
}, { timestamps: true });

submissionSchema.index({ experimentId: 1, userId: 1, date: 1 }, { unique: true });

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;


