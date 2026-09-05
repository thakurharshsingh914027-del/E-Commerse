
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiPhone, HiArrowLeft } from 'react-icons/hi';
import API from '../services/api';
import { toast } from 'react-hot-toast';
const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Local state for the form
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
  });

  // Pre-fill form when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const toastId = toast.loading("Saving...");

  try {
    const response = await API.patch('/api/auth/update-profile', formData);

    if (response.data.success) {
      toast.success("Profile Updated!", { id: toastId });

      if (setUser && response.data.user) {
        const updatedUser = {
          ...response.data.user,
          name: response.data.user.username || response.data.user.name,
        };
        setUser(updatedUser);
      }

      setTimeout(() => navigate('/profile'), 1500);
    } else {
      toast.error(response.data.message || "Failed to update", { id: toastId });
    }
  } catch (error) {
    const message = error.response?.data?.message || "Server connection error";
    toast.error(message, { id: toastId });
  }
};

  return (
    <div className="edit-profile-container">
      <div className="edit-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back
        </button>
        <h2>Edit Profile Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><HiUser /> Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>

          <div className="input-group">
            <label><HiPhone /> Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
            />
          </div>

          <button type="submit" className="save-btn">Update Profile</button>
        </form>
      </div>

      <style jsx>{`
        .edit-profile-container { padding: 120px 20px; background: #f8f9fa; min-height: 100vh; display: flex; justify-content: center; }
        .edit-card { background: white; padding: 35px; border-radius: 15px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
        .back-btn { border: none; background: none; color: #ff6b35; display: flex; align-items: center; gap: 5px; cursor: pointer; margin-bottom: 20px; font-weight: 600; }
        h2 { margin-bottom: 25px; color: #333; font-size: 22px; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 14px; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; transition: 0.3s; }
        input:focus { border-color: #ff6b35; outline: none; box-shadow: 0 0 0 2px rgba(255,107,53,0.1); }
        .save-btn { width: 100%; padding: 14px; background: #ff6b35; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; }
        .save-btn:hover { background: #e85a2a; transform: translateY(-1px); }
      `}</style>
    </div>
  );
};

export default EditProfile;
// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { HiUser, HiPhone, HiArrowLeft } from 'react-icons/hi';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const EditProfile = () => {
//     const { user, setUser, authorizationToken } = useAuth();
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         username: user?.username || '',
//         phone: user?.phone || '',
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//   e.preventDefault();

//   // 1. Double check the token in the console
//   console.log("Token Value:", authorizationToken);

//   if (!authorizationToken || authorizationToken === "Bearer null") {
//     toast.error("Session expired. Please log in again.");
//     return;
//   }

//   try {
//     const response = await axios.patch(
//       'http://localhost:5000/api/auth/update-profile',
//       formData,
//       {
//         headers: { 
//           // Ensure this matches exactly what your backend middleware expects
//           Authorization: authorizationToken 
//         }
//       }
//     );

//     if (response.data.success) {
//       toast.success("Profile Updated!");
//       setUser(response.data.user);
//       navigate('/profile');
//     }
//   } catch (error) {
//     // This will catch the "No token provided" message from your backend
//     const errorMsg = error.response?.data?.message || "Update failed";
//     toast.error(errorMsg);
//     console.error("Backend Error:", error.response?.data);
//   }
// };

//     return (
//         <div className="edit-profile-container">
//             <div className="edit-card">
//                 <button className="back-btn" onClick={() => navigate(-1)}>
//                     <HiArrowLeft /> Back
//                 </button>
//                 <h2>Edit Profile</h2>

//                 <form onSubmit={handleSubmit}>
//                     <div className="input-group">
//                         <label><HiUser /> Username</label>
//                         <input
//                             type="text"
//                             name="username"
//                             value={formData.username}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>

//                     <div className="input-group">
//                         <label><HiPhone /> Phone Number</label>
//                         <input
//                             type="text"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleChange}
//                         />
//                     </div>

//                     <button type="submit" className="save-btn">Save Changes</button>
//                 </form>
//             </div>

//             <style jsx>{`
//         .edit-profile-container {
//           padding: 120px 20px;
//           background: #f4f7f6;
//           min-height: 100vh;
//           display: flex;
//           justify-content: center;
//         }
//           .edit-profile-btn {
//         position: absolute;
//         right: 0;
//         top: 0;
//         z-index: 10; /* Ensure it's above the background */
//           display: flex;
//          align-items: center;
//            gap: 8px;
//           color: #ff6b35;
//          text-decoration: none;
//           font-weight: 600;
//          cursor: pointer; /* Force pointer cursor */
//       }
//         .edit-card {
//           background: white;
//           padding: 30px;
//           border-radius: 12px;
//           box-shadow: 0 4px 20px rgba(0,0,0,0.08);
//           width: 100%;
//           max-width: 450px;
//         }
//         .back-btn {
//           border: none;
//           background: none;
//           color: #666;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           cursor: pointer;
//           margin-bottom: 20px;
//         }
//         h2 { margin-bottom: 25px; color: #333; }
//         .input-group { margin-bottom: 20px; }
//         .input-group label {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 8px;
//           font-weight: 600;
//           color: #555;
//         }
//         input {
//           width: 100%;
//           padding: 12px;
//           border: 1px solid #ddd;
//           border-radius: 8px;
//           outline: none;
//         }
//         input:focus { border-color: #ff6b35; }
//         .save-btn {
//           width: 100%;
//           padding: 14px;
//           background: #ff6b35;
//           color: white;
//           border: none;
//           border-radius: 8px;
//           font-weight: bold;
//           cursor: pointer;
//           transition: 0.3s;
//         }
//         .save-btn:hover { background: #e85a2a; }
//       `}</style>
//         </div>
//     );
// };

// export default EditProfile;
