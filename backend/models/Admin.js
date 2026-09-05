const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Admin", adminSchema);


// const mongoose = require("mongoose");
// const { z } = require("zod");
// const adminSchema = z.object({
//   email: z
//     .string({ required_error: "Email is required" })
//     .trim()
//     .email({ message: "Invalid email address" })
//     .min(3, { message: "Email must be at least 3 chars." })
//     .max(255, { message: "Email must be less than 255 chars." }),

//   password: z
//     .string({ required_error: "Password is required" })
//     .trim()
//     .min(7, { message: "Password must be at least 7 chars." })
//     .max(1024, { message: "Password must be less than 1024 chars." }),
// });

// module.exports = ("Admin", adminSchema);

