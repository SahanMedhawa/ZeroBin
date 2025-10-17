import mongoose from "mongoose";

// ============ CONSTANTS ============

/**
 * Valid contact status values
 */
const CONTACT_STATUSES = {
  NEW: "new",
  READ: "read",
  RESPONDED: "responded"
};

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        EMAIL_REGEX,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CONTACT_STATUSES),
      default: CONTACT_STATUSES.NEW,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);
export { CONTACT_STATUSES };
