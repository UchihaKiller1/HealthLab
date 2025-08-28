import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: { type: String, enum: ["text","number","checkbox","slider","dropdown"], required: true },
    options: [{ type: String }]
}, { _id: false });

const experimentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, enum: ["fitness","diet","sleep","mental health","other"], required: true },
    formSchema: { type: [formFieldSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    // Optional duration in days. If provided, the experiment ends automatically at endsAt
    durationDays: { type: Number, min: 1 },
    // Computed end date at creation from durationDays. If absent, experiment is open-ended
    endsAt: { type: Date },
    // Track participants for quick lookups
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: { createdAt: true, updatedAt: true } });

// Virtual to expose whether the experiment is currently active
experimentSchema.virtual("isActive").get(function(){
    if (!this.endsAt) return true;
    return new Date(this.endsAt).getTime() > Date.now();
});

const Experiment = mongoose.models.Experiment || mongoose.model("Experiment", experimentSchema);
export default Experiment;


