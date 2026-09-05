import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader.jsx";
import api from "../api/api.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  image: "",
  rating: "",
  stock: "",
  tags: "",
  salesCount: "",
};

const actionLabel = {
  view: "viewed",
  cart: "added to cart",
  purchase: "purchased",
  like: "liked",
};

const formatCategoryLabel = (value = "") =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [assigningVendorId, setAssigningVendorId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [summaryRes, productsRes, usersRes, categoriesRes, logsRes] = await Promise.all([
        api.get("/admin/summary"),
        api.get("/products"),
        api.get("/admin/users"),
        api.get("/admin/categories"),
        api.get("/admin/recommendation-logs"),
      ]);

      setSummary(summaryRes.data);
      setProducts(productsRes.data.products || []);
      setUsers(usersRes.data || []);
      setCategories(categoriesRes.data.categories || []);
      setLogs(logsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: "Products", value: summary?.productCount || 0 },
      { label: "Users", value: summary?.userCount || 0 },
      { label: "Orders", value: summary?.orderCount || 0 },
      { label: "Recommendation Logs", value: summary?.activityCount || 0 },
    ],
    [summary]
  );

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      ...product,
      tags: product.tags.join(", "),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating),
      stock: Number(formData.stock),
      salesCount: Number(formData.salesCount),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setEditingId(null);
      setFormData(emptyForm);
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save product");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete product");
    }
  };

  const handleAssignCategory = async (userId, assignedCategory) => {
    setAssigningVendorId(userId);

    try {
      const response = await api.put(`/admin/vendors/${userId}/category`, {
        assignedCategory: assignedCategory || null,
      });
      const updatedUser = response.data.user;

      setUsers((previousUsers) =>
        previousUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      toast.success(response.data.message || "Vendor category updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vendor category");
    } finally {
      setAssigningVendorId(null);
    }
  };

  if (loading) {
    return <Loader fullScreen label="Loading admin dashboard" />;
  }

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Admin Panel</p>
        <h1 className="text-4xl font-black text-slate-950">Recommendation commerce dashboard</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="panel p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>
            {editingId && (
              <button
                type="button"
                className="text-sm font-semibold text-slate-500"
                onClick={() => {
                  setEditingId(null);
                  setFormData(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
          {Object.keys(emptyForm).map((key) => (
            <textarea
              key={key}
              rows={key === "description" ? 4 : 1}
              className="input resize-none"
              placeholder={key}
              value={formData[key]}
              onChange={(event) => setFormData((previous) => ({ ...previous, [key]: event.target.value }))}
            />
          ))}
          <button type="submit" className="btn-primary w-full">
            {editingId ? "Update Product" : "Create Product"}
          </button>
        </form>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-2xl font-black text-slate-950">Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-950">{product.name}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">Rs. {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">★ {product.rating.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button type="button" className="text-teal-700" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button type="button" className="text-rose-600" onClick={() => handleDelete(product._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-2xl font-black text-slate-950">Users</h2>
          </div>
          <div className="space-y-3 p-6">
            {users.map((user) => (
              <div key={user._id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{user.username || user.name || "User"}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {user.role}
                    </p>
                  </div>

                  {user.role === "vendor" && (
                    <div className="w-full lg:w-64">
                      <select
                        className="input"
                        value={user.assignedCategory?._id || ""}
                        disabled={assigningVendorId === user._id}
                        onChange={(event) => handleAssignCategory(user._id, event.target.value)}
                      >
                        <option value="">No category assigned</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {formatCategoryLabel(category.name)}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-slate-500">
                        Current:{" "}
                        {user.assignedCategory?.name
                          ? formatCategoryLabel(user.assignedCategory.name)
                          : "None"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-2xl font-black text-slate-950">Recommendation Logs</h2>
          </div>
          <div className="space-y-3 p-6">
            {logs.map((log) => (
              <div key={log._id} className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">
                  {log.userId?.username || log.userId?.name || "User"} {actionLabel[log.actionType] || log.actionType}{" "}
                  {log.productId?.name || "product"}
                </p>
                <p className="text-sm text-slate-500">
                  {log.category} • {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
