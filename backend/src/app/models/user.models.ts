import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false
    },
    firebaseUid: {
        type: String,
        required: true
    },
    // ─── Credits ─────────────────────────────────────────────
    credits: {
        type: Number,
        default: 50,
        min: 0,
    },
    // ─── Razorpay ────────────────────────────────────────────
    razorpayCustomerId: {
        type: String,
        required: false,
    },
}, { timestamps: true });

userSchema.index({ firebaseUid: 1 });

export const User = mongoose.model('User', userSchema);