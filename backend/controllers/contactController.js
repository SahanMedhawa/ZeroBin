import Contact, { CONTACT_STATUSES } from "../models/contactModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ============ HELPER FUNCTIONS ============

/**
 * Find contact by ID and throw error if not found
 * DRY helper to avoid repeating this pattern in multiple functions
 * @param {String} id - Contact ID
 * @returns {Promise<Contact>} Contact document
 * @throws {Error} If contact not found
 */
const findContactOrFail = async (id) => {
  const contact = await Contact.findById(id);
  
  if (!contact) {
    const error = new Error("Contact not found");
    error.statusCode = 404;
    throw error;
  }
  
  return contact;
};

// ============ CONTROLLER FUNCTIONS ============

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
    // Log contact submission (public endpoint, security relevant)
    console.log(`[CONTACT] New submission: ID=${contact._id}, Email=${email}, Subject=${subject || 'N/A'}`);
    
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
  const contact = await findContactOrFail(req.params.id);

  // Mark as read if new
  if (contact.status === CONTACT_STATUSES.NEW) {
    contact.status = CONTACT_STATUSES.READ;
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

  const contact = await findContactOrFail(req.params.id);

  if (status) {
    contact.status = status;
  }

  const updatedContact = await contact.save();

  // Log admin action
  console.log(`[CONTACT] Status updated: ID=${contact._id}, NewStatus=${status}, Email=${contact.email}`);

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
  const contact = await findContactOrFail(req.params.id);

  // Log deletion before removing (audit trail)
  console.log(`[CONTACT] Deleted: ID=${contact._id}, Email=${contact.email}, Status=${contact.status}`);

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
