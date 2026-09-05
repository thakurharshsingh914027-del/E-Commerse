
const Contact = require("../models/contact-model");

const contactForm = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    console.log("SAVED:", contact);

    return res.status(201).json({
      message: "Message submitted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Message not submitted",
      error: error.message,
    });
  }
};

module.exports = contactForm;

