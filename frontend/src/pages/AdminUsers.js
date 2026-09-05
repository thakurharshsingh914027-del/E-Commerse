import React, { useState, useEffect } from 'react';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
  HiSearch,
  HiTrash,
  HiCheck,
  HiX,
  HiUsers,
  HiRefresh,
  HiUserGroup,
  HiUserAdd,
} from 'react-icons/hi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  // --- 1. DATA FETCHING ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/admin/users');
      // Updated to extract data correctly based on your typical API response structure
      const finalArray = response.data?.data || response.data?.users || response.data || [];
      setUsers(finalArray);
      setFilteredUsers(finalArray);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/api/admin/categories');
      const categoryList = response.data?.categories || response.data?.data || response.data || [];
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  // --- 2. SEARCH LOGIC ---
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(u => 
      // FIX: Changed 'u.name' to 'u.username' to match your database
      (u.username || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // --- 3. APPROVAL LOGIC ---
  const handleApprove = async (userId) => {
    setActionId(userId);
    try {
      const res = await API.put(`/api/admin/vendors/${userId}/approve`); 
      const updatedUser = res.data.user;

      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, isApproved: updatedUser.isApproved } : u
      ));
      
      toast.success(updatedUser.isApproved ? 'Vendor Approved' : 'Approval Revoked');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionId(userId);
    try {
      await API.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("User removed successfully");
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setActionId(null);
    }
  };

  const handleAssignCategory = async (userId, assignedCategory) => {
    setActionId(userId);
    try {
      const res = await API.put(`/api/admin/vendors/${userId}/category`, {
        assignedCategory: assignedCategory || null,
      });
      const updatedUser = res.data?.user;

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user))
      );

      toast.success(res.data?.message || 'Vendor category updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setActionId(null);
    }
  };

  const formatCategoryLabel = (value) =>
    String(value || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  return (
    <DashboardLayout role="Admin" activePage="Users">
      {/* Quick Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#E3F2FD', color: '#0984E3', padding: '12px', borderRadius: '10px', fontSize: '24px' }}><HiUserGroup /></div>
            <div>
                <p style={{ margin: 0, color: '#868E96', fontSize: '12px' }}>Total Users</p>
                <h3 style={{ margin: 0 }}>{users.length}</h3>
            </div>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#E0FFF8', color: '#00B894', padding: '12px', borderRadius: '10px', fontSize: '24px' }}><HiUserAdd /></div>
            <div>
                <p style={{ margin: 0, color: '#868E96', fontSize: '12px' }}>Vendors</p>
                <h3 style={{ margin: 0 }}>{users.filter(u => u.role === 'vendor').length}</h3>
            </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>User Management</h2>
          <div style={{ position: 'relative' }}>
            <HiSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 35px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '280px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6', color: '#868E96', fontSize: '12px' }}>
                  <th style={{ padding: '12px' }}>USERNAME</th>
                  <th style={{ padding: '12px' }}>EMAIL ADDRESS</th>
                  <th style={{ padding: '12px' }}>ROLE</th>
                  <th style={{ padding: '12px' }}>ASSIGNED CATEGORY</th>
                  <th style={{ padding: '12px' }}>VENDOR STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const role = (user.role || 'customer').toLowerCase();
                  const isApproved = user.isApproved === true;
                  const isLoading = actionId === user._id;
                  const assignedCategory = user.assignedCategory?.name || user.assignedCategory || '';
                  const categoryLabel = assignedCategory
                    ? assignedCategory
                        .split('-')
                        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join(' ')
                    : '';

                  return (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {/* FIX: Using user.username here */}
                      <td style={{ padding: '16px 12px', fontWeight: '600' }}>{user.username || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', color: '#4b5563' }}>{user.email}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                          background: role === 'admin' ? '#fee2e2' : role === 'vendor' ? '#dbeafe' : '#f3f4f6',
                          color: role === 'admin' ? '#991b1b' : role === 'vendor' ? '#1e40af' : '#374151'
                        }}>
                          {role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {role === 'vendor' ? (
                          <select
                            value={user.assignedCategory?._id || ''}
                            onChange={(e) => handleAssignCategory(user._id, e.target.value)}
                            disabled={isLoading}
                            style={{
                              minWidth: '170px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: '#374151'
                            }}
                          >
                            <option value="">Unassigned</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {formatCategoryLabel(category.name)}
                              </option>
                            ))}
                          </select>
                        ) : <span style={{ color: '#adb5bd' }}>—</span>}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {role === 'vendor' ? (
                            <span style={{ 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                background: isApproved ? '#dcfce7' : '#fef9c3',
                                color: isApproved ? '#166534' : '#854d0e'
                              }}>
                                {isApproved ? 'APPROVED' : 'PENDING'}
                              </span>
                        ) : <span style={{ color: '#adb5bd' }}>—</span>}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          {role === 'vendor' && (
                            <button
                              onClick={() => handleApprove(user._id)}
                              disabled={isLoading}
                              title={isApproved ? "Revoke Approval" : "Approve Vendor"}
                              style={{ 
                                border: 'none', background: isApproved ? '#fff5f5' : '#f0fff4', 
                                color: isApproved ? '#ff7675' : '#2ecc71', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                border: `1px solid ${isApproved ? '#ff7675' : '#2ecc71'}`
                              }}
                            >
                              {isLoading ? <HiRefresh className="animate-spin" /> : (isApproved ? <HiX /> : <HiCheck />)}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={isLoading || role === 'admin'}
                            title="Delete User"
                            style={{ border: 'none', background: '#fff5f5', color: '#ff7675', padding: '8px', borderRadius: '8px', cursor: role === 'admin' ? 'not-allowed' : 'pointer', border: '1px solid #ff7675', opacity: role === 'admin' ? 0.4 : 1 }}
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
// import React, { useState, useEffect } from 'react';
// import API from '../services/api';
// import DashboardLayout from '../components/DashboardLayout';
// import toast from 'react-hot-toast';
// import {
//   HiSearch,
//   HiTrash,
//   HiCheck,
//   HiX,
//   HiUsers,
//   HiRefresh,
//   HiUserGroup,
//   HiUserAdd,
// } from 'react-icons/hi';

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [actionId, setActionId] = useState(null); // Track ID for loading states

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // --- 1. DATA FETCHING ---
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get('/api/admin/users');
//       console.log("RAW API DATA:", response.data); // CHECK CONSOLE TO SEE KEY NAMES

//       // Flexible data extraction
//       const fetchedData = response.data.users || response.data.data || response.data;
//       const finalArray = Array.isArray(fetchedData) ? fetchedData : [];
      
//       setUsers(finalArray);
//       setFilteredUsers(finalArray);
//     } catch (error) {
//       console.error("Fetch Error:", error);
//       toast.error('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- 2. SEARCH LOGIC ---
//   useEffect(() => {
//     const query = searchQuery.toLowerCase();
//     const filtered = users.filter(u => 
//       (u.name || u.fullName || "").toLowerCase().includes(query) ||
//       (u.email || "").toLowerCase().includes(query)
//     );
//     setFilteredUsers(filtered);
//   }, [searchQuery, users]);

//   // --- 3. APPROVAL LOGIC ---
//   const handleApprove = async (userId, currentStatus) => {
//   setActionId(userId);
//   try {
//     // URL matches the backend router.put('/vendors/:id/approve')
//     const res = await API.put(`/api/admin/vendors/${userId}/approve`); 
    
//     const updatedUser = res.data.user;

//     // Update state so UI refreshes immediately
//     setUsers(prev => prev.map(u => 
//       u._id === userId ? { ...u, isApproved: updatedUser.isApproved } : u
//     ));
    
//     toast.success(`Status: ${updatedUser.isApproved ? 'Approved' : 'Pending'}`);
//   } catch (error) {
//     console.error("Approval Error:", error.response?.data);
//     toast.error(error.response?.data?.message || "Failed to update vendor");
//   } finally {
//     setActionId(null);
//   }
// };
// // --- 4. DELETE LOGIC ---
//   const handleDelete = async (userId) => {
//     if (!window.confirm("Delete this user?")) return;
//     setActionId(userId);
//     try {
//       await API.delete(`/api/admin/users/${userId}`);
//       setUsers(prev => prev.filter(u => u._id !== userId));
//       toast.success("User removed");
//     } catch (error) {
//       toast.error("Delete failed");
//     } finally {
//       setActionId(null);
//     }
//   };

//   // --- 4. DATA HELPERS ---
//   const getRole = (user) => user.role || 'customer'; 
//   const getIsApproved = (user) => user.isApproved === true || user.status === 'Approved';

//   return (
//     <DashboardLayout role="Admin" activePage="Users">
//       <div className="data-table-wrapper" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h2 style={{ fontSize: '20px', fontWeight: '700' }}>User Management</h2>
//           <div style={{ position: 'relative' }}>
//             <HiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
//             <input 
//               type="text" 
//               placeholder="Search users..." 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ padding: '8px 12px 8px 35px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '250px' }}
//             />
//           </div>
//         </div>

//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '13px' }}>
//               <th style={{ padding: '12px' }}>USER</th>
//               <th style={{ padding: '12px' }}>EMAIL</th>
//               <th style={{ padding: '12px' }}>ROLE</th>
//               <th style={{ padding: '12px' }}>STATUS</th>
//               <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredUsers.map((user) => {
//               const role = getRole(user).toLowerCase();
//               const isApproved = getIsApproved(user);
//               const isLoading = actionId === user._id;

//               return (
//                 <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
//                   <td style={{ padding: '12px', fontWeight: '500' }}>{user.name || user.fullName || 'N/A'}</td>
//                   <td style={{ padding: '12px', color: '#4b5563' }}>{user.email}</td>
//                   <td style={{ padding: '12px' }}>
//                     <span style={{ 
//                       padding: '4px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize',
//                       background: role === 'admin' ? '#fee2e2' : role === 'vendor' ? '#dbeafe' : '#f3f4f6',
//                       color: role === 'admin' ? '#991b1b' : role === 'vendor' ? '#1e40af' : '#374151'
//                     }}>
//                       {role}
//                     </span>
//                   </td>
//                   <td style={{ padding: '12px' }}>
//                     <span style={{ 
//                       padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
//                       background: isApproved ? '#dcfce7' : '#fef9c3',
//                       color: isApproved ? '#166534' : '#854d0e'
//                     }}>
//                       {isApproved ? 'Approved' : 'Pending'}
//                     </span>
//                   </td>
//                   <td style={{ padding: '12px' }}>
//                     <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
//                       {role === 'vendor' && (
//                         <button
//                           onClick={() => handleApprove(user._id, isApproved)}
//                           disabled={isLoading}
//                           style={{ 
//                             border: 'none', background: isApproved ? '#fee2e2' : '#dcfce7', 
//                             color: isApproved ? '#ef4444' : '#22c55e', padding: '6px', borderRadius: '6px', cursor: 'pointer' 
//                           }}
//                         >
//                           {isLoading ? <HiRefresh className="animate-spin" /> : (isApproved ? <HiX /> : <HiCheck />)}
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(user._id)}
//                         disabled={isLoading || role === 'admin'}
//                         style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer', opacity: role === 'admin' ? 0.5 : 1 }}
//                       >
//                         <HiTrash />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminUsers;
// import React, { useState, useEffect } from 'react';
// import API from '../services/api';
// import DashboardLayout from '../components/DashboardLayout';
// import toast from 'react-hot-toast';
// import {
//   HiSearch,
//   HiTrash,
//   HiCheck,
//   HiX,
//   HiUsers,
//   HiRefresh,
//   HiUserGroup,
//   HiUserAdd,
// } from 'react-icons/hi';

// const formatDate = (date) =>
//   new Date(date).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });

// const ROLE_BADGE_COLORS = {
//   Admin: { background: '#E17055', color: '#FFFFFF' },
//   Vendor: { background: '#0984E3', color: '#FFFFFF' },
//   Customer: { background: '#00B894', color: '#FFFFFF' },
// };

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [approving, setApproving] = useState(null);
//   const [deleting, setDeleting] = useState(null);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredUsers(users);
//     } else {
//       const query = searchQuery.toLowerCase();
//       setFilteredUsers(
//         users.filter(
//           (u) =>
//             u.name?.toLowerCase().includes(query) ||
//             u.fullName?.toLowerCase().includes(query) ||
//             u.email?.toLowerCase().includes(query)
//         )
//       );
//     }
//   }, [searchQuery, users]);

//  const fetchUsers = async () => {
//   setLoading(true);
//   try {
//     const response = await API.get('/api/admin/users');

//     console.log("API RESPONSE:", response.data); 

//     // FIX: Access response.data directly since it is the array
//     const data = response.data; 

//     setUsers(Array.isArray(data) ? data : []);
//   } catch (error) {
//     console.error(error);
//     toast.error('Failed to load users');
//     setUsers([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleApprove = async (userId, userName) => {
//   setApproving(userId);
//   try {
//     const res = await API.put(`/api/admin/vendors/${userId}/approve`);

//     const updatedUser = res.data.data;

//     setUsers((prev) =>
//       prev.map((u) =>
//         u._id === userId ? updatedUser : u
//       )
//     );

//     toast.success(
//       `${userName} has been ${updatedUser.isApproved ? 'approved' : 'rejected'}`
//     );
//   } catch (error) {
//     toast.error(error.response?.data?.message || 'Failed to update user status');
//   } finally {
//     setApproving(null);
//   }
// };
//   const handleDelete = async (userId, userName) => {
//     if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
//       return;
//     }

//     setDeleting(userId);
//     try {
//       await API.delete(`/api/admin/users/${userId}`);
//       setUsers((prev) => prev.filter((u) => u._id !== userId));
//       toast.success(`"${userName}" has been deleted`);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to delete user');
//     } finally {
//       setDeleting(null);
//     }
//   };


//   const getUserName = (user) => user.name || user.fullName || 'N/A';
//   const getUserEmail = (user) => user.email || 'N/A';
//   const getUserRole = (user) => user.role || 'Customer';
//   const getStoreName = (user) => user.storeName || user.vendor?.storeName || null;
//   const getUserStatus = (user) => {
//     if (user.role === 'Admin') return 'Approved';
//     if (user.isApproved !== false) return 'Approved';
//     return 'Pending';
//   };
//   const getJoinDate = (user) => user.createdAt || user.joinDate;

//   const totalUsers = users.length;
//   const vendorCount = users.filter((u) => getUserRole(u) === 'Vendor').length;
//   const customerCount = users.filter((u) => getUserRole(u) === 'Customer').length;

//   const getAvatarColor = (name) => {
//     if (!name || name === 'N/A') return '#ADB5BD';
//     const colors = ['#FF6B35', '#0984E3', '#00B894', '#6C5CE7', '#E17055', '#FDCB6E', '#00CEC9', '#D63031'];
//     let hash = 0;
//     for (let i = 0; i < name.length; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colors[Math.abs(hash) % colors.length];
//   };

//   if (loading) {
//     return (
//       <DashboardLayout role="Admin" activePage="Users">
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//           gap: '16px',
//           marginBottom: '24px',
//         }}>
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="card" style={{ padding: '20px' }}>
//               <div className="skeleton skeleton-text short" style={{ width: '50%', marginBottom: '12px' }} />
//               <div className="skeleton skeleton-text title" style={{ width: '40%' }} />
//             </div>
//           ))}
//         </div>
//         <div className="data-table-wrapper">
//           <div className="data-table-header">
//             <h3>All Users</h3>
//             <div className="data-table-search">
//               <div className="skeleton" style={{ width: '250px', height: '40px', borderRadius: '8px' }} />
//             </div>
//           </div>
//           {[...Array(6)].map((_, i) => (
//             <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: '1px solid #E9ECEF', alignItems: 'center' }}>
//               <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
//               <div style={{ flex: 1 }}>
//                 <div className="skeleton skeleton-text short" style={{ width: '50%', marginBottom: '6px' }} />
//                 <div className="skeleton skeleton-text medium" style={{ width: '70%' }} />
//               </div>
//               <div className="skeleton" style={{ width: '70px', height: '26px', borderRadius: '13px' }} />
//               <div className="skeleton" style={{ width: '80px', height: '20px' }} />
//               <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '14px' }} />
//               <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '6px' }} />
//             </div>
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout role="Admin" activePage="Users">
//       {/* Stats Row */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//         gap: '16px',
//         marginBottom: '24px',
//       }}>
//         <div className="card" style={{ padding: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div>
//               <p style={{ fontSize: '13px', color: '#868E96', fontWeight: '500', marginBottom: '4px' }}>
//                 Total Users
//               </p>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#212529', margin: 0 }}>
//                 {totalUsers}
//               </h3>
//             </div>
//             <div style={{
//               width: '44px',
//               height: '44px',
//               borderRadius: '10px',
//               background: '#E3F2FD',
//               color: '#0984E3',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '20px',
//             }}>
//               <HiUsers />
//             </div>
//           </div>
//         </div>
//         <div className="card" style={{ padding: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div>
//               <p style={{ fontSize: '13px', color: '#868E96', fontWeight: '500', marginBottom: '4px' }}>
//                 Vendors
//               </p>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#212529', margin: 0 }}>
//                 {vendorCount}
//               </h3>
//             </div>
//             <div style={{
//               width: '44px',
//               height: '44px',
//               borderRadius: '10px',
//               background: '#E0FFF8',
//               color: '#00B894',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '20px',
//             }}>
//               <HiUserAdd />
//             </div>
//           </div>
//         </div>
//         <div className="card" style={{ padding: '20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div>
//               <p style={{ fontSize: '13px', color: '#868E96', fontWeight: '500', marginBottom: '4px' }}>
//                 Customers
//               </p>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#212529', margin: 0 }}>
//                 {customerCount}
//               </h3>
//             </div>
//             <div style={{
//               width: '44px',
//               height: '44px',
//               borderRadius: '10px',
//               background: '#FFF0E8',
//               color: '#FF6B35',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '20px',
//             }}>
//               <HiUserGroup />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="data-table-wrapper">
//         <div className="data-table-header">
//           <h3>
//             All Users
//             <span style={{
//               marginLeft: '8px',
//               fontSize: '13px',
//               fontWeight: '500',
//               color: '#868E96',
//             }}>
//               ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
//             </span>
//           </h3>
//           <div className="data-table-search">
//             <HiSearch />
//             <input
//               type="text"
//               placeholder="Search by name or email..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ width: '280px' }}
//             />
//           </div>
//         </div>

//         {filteredUsers.length > 0 ? (
//           <div style={{ overflowX: 'auto' }}>
//             <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     User
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Email
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Role
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Store Name
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Status
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Joined
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((user) => {
//                   const name = getUserName(user);
//                   const role = getUserRole(user);
//                   const storeName = getStoreName(user);
//                   const status = getUserStatus(user);
//                   const joinDate = getJoinDate(user);
//                   const roleBadge = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.Customer;
//                   const isApproving = approving === user._id;
//                   const isDeleting = deleting === user._id;
//                   const avatarColor = getAvatarColor(name);

//                   return (
//                     <tr key={user._id}
//                       style={{ borderBottom: '1px solid #F1F3F5', transition: 'all 0.2s ease' }}
//                       onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
//                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                           <div style={{
//                             width: '40px',
//                             height: '40px',
//                             borderRadius: '50%',
//                             background: avatarColor,
//                             color: '#FFFFFF',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             fontWeight: '700',
//                             fontSize: '15px',
//                             flexShrink: 0,
//                           }}>
//                             {name !== 'N/A' ? name.charAt(0).toUpperCase() : '?'}
//                           </div>
//                           <span style={{
//                             fontSize: '14px',
//                             fontWeight: '600',
//                             color: '#212529',
//                             whiteSpace: 'nowrap',
//                           }}>
//                             {name}
//                           </span>
//                         </div>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', color: '#495057', whiteSpace: 'nowrap' }}>
//                         {getUserEmail(user)}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <span style={{
//                           display: 'inline-block',
//                           padding: '3px 10px',
//                           borderRadius: '20px',
//                           fontSize: '12px',
//                           fontWeight: '600',
//                           background: roleBadge.background,
//                           color: roleBadge.color,
//                           whiteSpace: 'nowrap',
//                         }}>
//                           {role}
//                         </span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', color: '#495057', whiteSpace: 'nowrap' }}>
//                         {storeName || <span style={{ color: '#CED4DA' }}>—</span>}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <span style={{
//                           display: 'inline-block',
//                           padding: '4px 12px',
//                           borderRadius: '20px',
//                           fontSize: '12px',
//                           fontWeight: '600',
//                           background: status === 'Approved' ? '#00B894' : '#FDCB6E',
//                           color: '#FFFFFF',
//                           whiteSpace: 'nowrap',
//                         }}>
//                           {status}
//                         </span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', color: '#868E96', whiteSpace: 'nowrap' }}>
//                         {joinDate ? formatDate(joinDate) : 'N/A'}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
//                           {role === 'Vendor' && (
//                             <button
//                               // onClick={() => handleApprove(user._id, name, user.isApproved !== false)}
//                               onClick={() => handleApprove(user._id, name)}
//                               disabled={isApproving}
//                               title={user.isApproved !== false ? 'Reject Vendor' : 'Approve Vendor'}
//                               style={{
//                                 width: '32px',
//                                 height: '32px',
//                                 borderRadius: '6px',
//                                 display: 'inline-flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 background: user.isApproved !== false ? '#FFE8E3' : '#E0FFF8',
//                                 color: user.isApproved !== false ? '#E17055' : '#00B894',
//                                 border: 'none',
//                                 cursor: isApproving ? 'not-allowed' : 'pointer',
//                                 fontSize: '16px',
//                                 opacity: isApproving ? 0.6 : 1,
//                                 transition: 'all 0.2s ease',
//                               }}
//                             >
//                               {isApproving ? <HiRefresh /> : (user.isApproved !== false ? <HiX /> : <HiCheck />)}
//                             </button>
//                           )}
//                           <button
//                             onClick={() => handleDelete(user._id, name)}
//                             disabled={isDeleting || role === 'Admin'}
//                             title={role === 'Admin' ? 'Cannot delete admin' : 'Delete User'}
//                             style={{
//                               width: '32px',
//                               height: '32px',
//                               borderRadius: '6px',
//                               display: 'inline-flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               background: role === 'Admin' ? '#F1F3F5' : '#FFE8E3',
//                               color: role === 'Admin' ? '#CED4DA' : '#E17055',
//                               border: 'none',
//                               cursor: (isDeleting || role === 'Admin') ? 'not-allowed' : 'pointer',
//                               fontSize: '16px',
//                               opacity: (isDeleting || role === 'Admin') ? 0.5 : 1,
//                               transition: 'all 0.2s ease',
//                             }}
//                           >
//                             {isDeleting ? <HiRefresh /> : <HiTrash />}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
//             <HiUsers style={{ fontSize: '56px', color: '#CED4DA', marginBottom: '16px' }} />
//             <h4 style={{ color: '#495057', marginBottom: '8px' }}>
//               {searchQuery ? 'No users found' : 'No users registered yet'}
//             </h4>
//             <p style={{ color: '#868E96', fontSize: '14px', marginBottom: '20px' }}>
//               {searchQuery
//                 ? `No users matching "${searchQuery}"`
//                 : 'Users will appear here once they register on ShopMart'}
//             </p>
//             {searchQuery && (
//               <button
//                 className="btn btn-outline btn-sm"
//                 onClick={() => setSearchQuery('')}
//               >
//                 Clear Search
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminUsers;
