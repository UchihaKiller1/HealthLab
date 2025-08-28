import Experiment from "../models/experiment.js";
import multer from "multer";
import path from "path";
import Submission from "../models/submission.js";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(process.cwd(), "backend", "uploads"));
    },
    filename: function(req, file, cb){
        const unique = Date.now() + "-" + Math.round(Math.random()*1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

export const upload = multer({ storage });

export async function createExperiment(req, res){
    try{
        const { title, description, category, durationDays } = req.body;
        const formSchema = req.body.formSchema ? JSON.parse(req.body.formSchema) : [];
        if(!title || !description || !category){
            return res.status(400).json({ message: "Missing required fields" });
        }
        if(!req.file){
            return res.status(400).json({ message: "Image is required" });
        }
        if(formSchema.length > 10){
            return res.status(400).json({ message: "Max 10 custom fields" });
        }
        const imageUrl = "/uploads/" + req.file.filename;
        // compute endsAt if durationDays provided
        let duration = undefined;
        let endsAt = undefined;
        if (durationDays !== undefined && durationDays !== null && String(durationDays).trim() !== ""){
            const parsed = Number(durationDays);
            if (!Number.isFinite(parsed) || parsed < 1) {
                return res.status(400).json({ message: "durationDays must be a positive number of days" });
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
            participants: []
        });
        res.status(201).json(exp);
    }catch(e){
        console.error(e);
        res.status(500).json({ message: "Failed to create experiment" });
    }
}

export async function listApprovedExperiments(req, res){
    try{
        const exps = await Experiment.find({ status: "approved" }).sort({ createdAt: -1 });
        // add computed status for convenience
        const now = Date.now();
        const mapped = exps.map(e => ({
            ...e.toObject(),
            runtimeStatus: e.endsAt ? (new Date(e.endsAt).getTime() > now ? "active" : "ended") : "active"
        }));
        res.json(mapped);
    }catch(e){
        res.status(500).json({ message: "Failed to fetch experiments" });
    }
}

export async function listPendingExperiments(req, res){
    try{
        const exps = await Experiment.find({ status: "pending" }).populate("createdBy", "email username").sort({ createdAt: -1 });
        res.json(exps);
    }catch(e){
        res.status(500).json({ message: "Failed to fetch pending" });
    }
}

export async function approveExperiment(req, res){
    try{
        const { id } = req.params;
        const updated = await Experiment.findByIdAndUpdate(id, { status: "approved" }, { new: true });
        if(!updated) return res.status(404).json({ message: "Not found" });
        res.json(updated);
    }catch(e){
        res.status(500).json({ message: "Failed to approve" });
    }
}

export async function rejectExperiment(req, res){
    try{
        const { id } = req.params;
        const updated = await Experiment.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if(!updated) return res.status(404).json({ message: "Not found" });
        res.json(updated);
    }catch(e){
        res.status(500).json({ message: "Failed to reject" });
    }
}

export async function listMyExperiments(req, res){
    try{
        const exps = await Experiment.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        const now = Date.now();
        const mapped = exps.map(e => ({
            ...e.toObject(),
            runtimeStatus: e.endsAt ? (new Date(e.endsAt).getTime() > now ? "active" : "ended") : "active"
        }));
        res.json(mapped);
    }catch(e){
        res.status(500).json({ message: "Failed to fetch your experiments" });
    }
}

export async function getExperimentDetails(req, res){
    try{
        const { id } = req.params;
        const exp = await Experiment.findById(id);
        if(!exp) return res.status(404).json({ message: "Not found" });
        res.json(exp);
    }catch(e){
        res.status(500).json({ message: "Failed to fetch experiment" });
    }
}

export async function joinExperiment(req, res){
    try{
        const { id } = req.params;
        const exp = await Experiment.findById(id);
        if(!exp) return res.status(404).json({ message: "Not found" });
        // Prevent joining ended experiments when duration provided
        if (exp.endsAt && new Date(exp.endsAt).getTime() <= Date.now()){
            return res.status(400).json({ message: "Experiment has ended" });
        }
        const userId = req.user.id;
        if (!exp.participants) exp.participants = [];
        if (exp.participants.find(p => String(p) === String(userId))){
            return res.status(200).json({ message: "Already joined" });
        }
        exp.participants.push(userId);
        await exp.save();
        res.json({ message: "Joined", experimentId: exp._id });
    }catch(e){
        res.status(500).json({ message: "Failed to join" });
    }
}

export async function leaveExperiment(req, res){
    try{
        const { id } = req.params;
        const userId = req.user.id;
        const exp = await Experiment.findById(id);
        if(!exp) return res.status(404).json({ message: "Not found" });
        exp.participants = (exp.participants || []).filter(p => String(p) !== String(userId));
        await exp.save();
        res.json({ message: "Left", experimentId: exp._id });
    }catch(e){
        res.status(500).json({ message: "Failed to leave" });
    }
}

export async function listJoinedExperiments(req, res){
    try{
        const userId = req.user.id;
        const exps = await Experiment.find({ participants: userId }).sort({ createdAt: -1 });
        const now = Date.now();
        const mapped = exps.map(e => ({
            ...e.toObject(),
            runtimeStatus: e.endsAt ? (new Date(e.endsAt).getTime() > now ? "active" : "ended") : "active"
        }));
        res.json(mapped);
    }catch(e){
        res.status(500).json({ message: "Failed to fetch joined experiments" });
    }
}

function getUtcMidnight(date){
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function submitDailyData(req, res){
    try{
        const { id } = req.params; // experiment id
        const userId = req.user.id;
        const exp = await Experiment.findById(id);
        if(!exp) return res.status(404).json({ message: "Experiment not found" });
        if (!exp.participants?.find(p => String(p) === String(userId))){
            return res.status(403).json({ message: "Join experiment first" });
        }
        if (exp.endsAt && new Date(exp.endsAt).getTime() <= Date.now()){
            return res.status(400).json({ message: "Experiment has ended" });
        }
        const values = req.body?.values || {};
        const today = getUtcMidnight(new Date());
        try{
            const created = await Submission.create({ experimentId: id, userId, date: today, values });
            return res.status(201).json(created);
        }catch(err){
            if (err && err.code === 11000){
                return res.status(400).json({ message: "Already submitted for today" });
            }
            throw err;
        }
    }catch(e){
        console.error(e);
        res.status(500).json({ message: "Failed to submit data" });
    }
}

export async function getDailySubmissionStatus(req, res){
    try{
        const { id } = req.params; // experiment id
        const userId = req.user.id;
        const exp = await Experiment.findById(id).select("_id endsAt");
        if(!exp) return res.status(404).json({ message: "Experiment not found" });
        const today = getUtcMidnight(new Date());
        const existing = await Submission.findOne({ experimentId: id, userId, date: today }).select("_id");
        res.json({ submittedToday: !!existing });
    }catch(e){
        res.status(500).json({ message: "Failed to load submission status" });
    }
}


