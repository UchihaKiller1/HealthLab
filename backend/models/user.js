import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema= new mongoose.Schema({

    email :{

        type: String,
        required: true,
        unique: true
    },

    firstname : {

        type : String,
        required: true
    },
    lastname : {

        type: String,
        required: true
    },
    username: {

        type: String,
        required: true,
        unique: true
    },
    phone:{

        type: String,
        required: true
    },
    password: {

        type:String,
        required : true
    },
    profilePicture: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    bio: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidate){
    return bcrypt.compare(candidate, this.password);
}

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;