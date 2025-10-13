import mongoose from "mongoose";

const garbageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User who made the request
    },
    address: {
      type: String,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Recyclable", "Non-Recyclable"],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Area", // Reference to the Area where the garbage will be collected
    },
    weight: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Collected", "In Progress", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Garbage = mongoose.model("Garbage", garbageSchema);

export default Garbage;
