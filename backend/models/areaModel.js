import mongoose from "mongoose";

const areaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: false,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique area names within the same district
areaSchema.index({ name: 1, district: 1 }, { unique: true });

const Area = mongoose.model("Area", areaSchema);

export default Area;
