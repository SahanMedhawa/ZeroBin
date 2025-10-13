import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false,
      sparse: true,
    },
    name: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Area",
    },
    contact: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if googleId is not present
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["Admin", "Resident", "WMA", "Collector"],
      default: "Resident",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
