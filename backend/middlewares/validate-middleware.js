

// // // module.exports = validate;
// const validate = (schema) => async (req, res, next) => {
//   try {
//     const parseBody = await schema.parseAsync(req.body);
//     req.body = parseBody;
//     next();

//   } catch (err) {
//     const error = new Error("Fill the input properly");
//     error.statusCode = 422;

//     // ✅ SAFE optional chaining
//     error.extraDetails = err?.errors?.[0]?.message || "Invalid input data";

//     next(error); // ✅ always pass ERROR OBJECT
//   }
// };

// module.exports = validate;
const validate = (schema) => async (req, res, next) => {
  try {
    const parsedBody = await schema.parseAsync(req.body);
    req.body = parsedBody;
    next();
  } catch (err) {
    console.log("ZOD ERROR:", err.issues); // 👈 ADD THIS TEMP

    const error = new Error("Fill the input properly");
    error.statusCode = 422;
    error.extraDetails = err?.issues?.[0]?.message || "Invalid input data";

    next(error);
  }
};

module.exports = validate;

