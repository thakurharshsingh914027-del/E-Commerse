const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // FIX: Compass shows your ID field is _id. 
    // decoded.id must match whatever you put in jwt.sign during login.
    const user = await User.findById(decoded.id || decoded._id).select("-password");

    if (!user) return res.status(401).json({ message: "Unauthorized: No user found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = user; // 🔥 THIS IS IMPORTANT

//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

module.exports = authMiddleware;

// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     console.log("Authorization header:", req.headers.authorization); // ✅ here

//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authMiddleware;

// const jwt = require("jsonwebtoken");
// const User = require("../models/user-model"); // Import your User model

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       // This is likely what you're hitting if the header isn't sent correctly
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     // IMPORTANT: Ensure process.env.JWT_SELECT_KEY matches your login/register secret
//     const decoded = jwt.verify(token, process.env.JWT_SELECT_KEY || process.env.JWT_SECRET);

//     // Fetch the user from the DB and exclude the password
//     // Use decoded.email or decoded.id depending on your token payload
//     const userData = await User.findOne({ email: decoded.email }).select("-password");

//     if (!userData) {
//       return res.status(401).json({ message: "User not found in database" });
//     }

//     // Attach the full Mongoose document to req.user
//     req.user = userData; 
//     req.token = token;
//     req.userID = userData._id;

//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error.message);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authMiddleware;
// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authMiddleware;




// const jwt = require ("jsonwebtoken");

// const authMiddleware = async (req, res, next) =>{
//     const token = req.header('Auththorization');
//     if(!token){
//         return res.status(401).json({message: "Unauthorized http, Token not provided"});
//     }
        
//          const jwtToken= token.replace('Beaser',"").trim();    
//                console.log("token from auth middleware", jwtToken);
//          try {
//             const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
//             next();

//          } catch (error) {
            
//          }
        
//          };

// module.export = authMiddleware;
// const jwt = require("jsonwebtoken");
// const User = require("../models/user-model");

// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({
//       message: "Unauthorized: Token not provided",
//     });
//   }

//   const jwtToken = token.replace("Bearer", "").trim();
//   console.log("Token from auth middleware:", jwtToken);

//   try {
//     // const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
//      const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
       
//     // Attach user info to request
//     // req.user = decoded;
//     const userData = await User.findOne({email:isVerified.email});
//     select({password:0,});
//         console.log(userdata);
//         req.user = userData;
//         req.token = token;
//         req.userID = userData._id;   
        
//         next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Unauthorized: Invalid or expired token",
//     });
//   }
// };

// // module.exports = authMiddleware;
// const jwt = require("jsonwebtoken");
// const User = require("../models/user-model");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         message: "Unauthorized: Token not provided",
//       });
//     }

//     // ✅ extract token safely
//     const jwtToken = authHeader.split(" ")[1];
//     console.log("Token from auth middleware:", jwtToken);

//     // ✅ verify token
//     const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

//     // ✅ find user & exclude password
//     const userData = await User.findOne({ email: decoded.email })
//       .select("-password");

//     if (!userData) {
//       return res.status(401).json({
//         message: "Unauthorized: User not found",
//       });
//     }

//     // ✅ attach to request
//     req.user = userData;
//     req.userID = userData._id;
//     req.token = jwtToken;

//     next();
//   } catch (error) {
//     console.error("Auth middleware error:", error.message);
//     return res.status(401).json({
//       message: "Unauthorized: Invalid or expired token",
//     });
//   }
// };

// module.exports = authMiddleware;
