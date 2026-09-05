import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiShieldCheck, 
  HiCalendar, 
  HiPencilAlt,
  HiShoppingBag
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const displayName =
    user?.username ||
    user?.name ||
    user?.fullName ||
    (user?.email ? user.email.split('@')[0] : 'User');
  const accountStatus =
    user?.role === 'vendor'
      ? user?.isApproved
        ? 'Verified & Active'
        : 'Pending Verification'
      : 'Verified & Active';

  // Format the date from MongoDB
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="profile-page-container">
      <div className="profile-header-bg"></div>
      
      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-main-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-title">
              <h1>{displayName}</h1>
              <span className="role-badge">{user?.role || 'customer'}</span>
            </div>
            <Link to="/edit-profile" className="edit-profile-btn">
              <HiPencilAlt /> Edit Profile
            </Link>
          </div>

          <div className="profile-info-grid">
            <div className="info-group">
              <label><HiMail /> Email Address</label>
              <p>{user?.email || 'Not Provided'}</p>
            </div>

            <div className="info-group">
              <label><HiPhone /> Phone Number</label>
              <p>{user?.phone || 'Not Provided'}</p>
            </div>

            <div className="info-group">
              <label><HiShieldCheck /> Account Status</label>
              <p className={accountStatus === 'Verified & Active' ? 'status-active' : 'status-pending'}>
                {accountStatus}
              </p>
            </div>

            <div className="info-group">
              <label><HiCalendar /> Member Since</label>
              <p>{joinDate}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Stats */}
        <div className="profile-stats-grid">
          <Link to="/orders" className="stat-card">
            <div className="stat-icon"><HiShoppingBag /></div>
            <div className="stat-info">
              <h3>My Orders</h3>
              <p>View and track your purchases</p>
            </div>
          </Link>

          <div className="stat-card">
            <div className="stat-icon"><HiUser /></div>
            <div className="stat-info">
              <h3>Security</h3>
              <p>Update your password & settings</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page-container {
          min-height: 100vh;
          background: #f8f9fa;
          padding-bottom: 50px;
        }
        .profile-header-bg {
          height: 200px;
          background: linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%);
        }
        .profile-content {
          max-width: 900px;
          margin: -100px auto 0;
          padding: 0 20px;
        }
        .profile-main-card {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 25px;
          border-bottom: 1px solid #eee;
          padding-bottom: 30px;
          margin-bottom: 30px;
          position: relative;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          background: #ff6b35;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: bold;
          box-shadow: 0 5px 15px rgba(255,107,53,0.3);
        }
        .profile-title h1 {
          margin: 0;
          font-size: 28px;
          color: #2d3436;
        }
        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e1f5fe;
          color: #0288d1;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 5px;
          text-transform: capitalize;
        }
        .edit-profile-btn {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ff6b35;
          text-decoration: none;
          font-weight: 600;
          transition: 0.3s;
        }
        .profile-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }
        .info-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #636e72;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .info-group p {
          font-weight: 600;
          color: #2d3436;
          margin: 0;
        }
        .status-active { color: #27ae60 !important; }
        .status-pending { color: #f39c12 !important; }

        .profile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          text-decoration: none;
          transition: 0.3s;
          border: 1px solid transparent;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #ff6b35;
        }
        .stat-icon {
          font-size: 30px;
          color: #ff6b35;
        }
        .stat-info h3 { margin: 0; color: #2d3436; font-size: 18px; }
        .stat-info p { margin: 5px 0 0; color: #636e72; font-size: 14px; }

        @media (max-width: 600px) {
          .profile-avatar-section { flex-direction: column; text-align: center; }
          .edit-profile-btn { position: static; margin-top: 15px; }
          .profile-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
