import Contact from "../models/contactModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Please provide name, email, and message");
  }

  // Create contact
  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
  });

  if (contact) {
    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you soon.",
      data: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt,
      },
    });
  } else {
    res.status(400);
    throw new Error("Failed to submit contact form");
  }
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Get single contact by ID (Admin only)
// @route   GET /api/contacts/:id
// @access  Private/Admin
const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  // Mark as read
  if (contact.status === "new") {
    contact.status = "read";
    await contact.save();
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

// @desc    Update contact status (Admin only)
// @route   PUT /api/contacts/:id
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (status) {
    contact.status = status;
  }

  const updatedContact = await contact.save();

  res.status(200).json({
    success: true,
    message: "Contact status updated successfully",
    data: updatedContact,
  });
});

// @desc    Delete contact (Admin only)
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});

export {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
