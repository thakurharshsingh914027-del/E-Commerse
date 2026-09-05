const { z } = require("zod");

const signupSchema = z.object({
  username: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 chars." })
    .max(255, { message: "Name must be less than 255 chars." }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(3)
    .max(255),

  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .min(10)
    .max(20),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(7)
    .max(1024),

  // ✅ ADD THIS
  role: z
    .enum(["customer", "vendor", "admin"])
    .optional()
    .default("customer"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email()
    .min(3)
    .max(255),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(7)
    .max(1024),
});

const adminSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email()
    .min(3)
    .max(255),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(7)
    .max(1024),
});

module.exports = { signupSchema, loginSchema, adminSchema };

// const { z } = require("zod");
// // const { signupSchema, loginSchema } = require("../validators/auth-validator");

// const signupSchema = z.object({
//   username: z
//     .string({ required_error: "Name is required" })
//     .trim()
//     .min(3, { message: "Name must be at least 3 chars." })
//     .max(255, { message: "Name must be less than 255 chars." }),

//   email: z
//     .string({ required_error: "Email is required" })
//     .trim()
//     .email({ message: "Invalid email address" })
//     .min(3, { message: "Email must be at least 3 chars." })
//     .max(255, { message: "Email must be less than 255 chars." }),

//   phone: z
//     .string({ required_error: "Phone is required" })
//     .trim()
//     .min(10, { message: "Phone must be at least 10 chars." })
//     .max(20, { message: "Phone must be less than 20 chars." }),

//   password: z
//     .string({ required_error: "Password is required" })
//     .trim()
//     .min(7, { message: "Password must be at least 7 chars." })
//     .max(1024, { message: "Password must be less than 1024 chars." }),
// });

// const loginSchema = z.object({
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

// module.exports = { signupSchema, loginSchema, adminSchema }; 

