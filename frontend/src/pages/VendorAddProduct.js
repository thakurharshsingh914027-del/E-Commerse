import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  category: '',
  subcategory: '',
  brand: '',
  stock: '',
  images: '', // Will hold FileList object on submit
  isFeatured: false,
  specifications: [{ key: '', value: '' }],
};

const VendorAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [assignedCategory, setAssignedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const formatCategoryLabel = (value) =>
    value
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const fetchCategories = async () => {
    try {
      const res = await API.get('/api/vendor/categories');
      const liveCategories = res.data?.categories || [];
      const vendorAssignedCategory = res.data?.assignedCategory?.name || '';

      setCategories(liveCategories);
      setAssignedCategory(vendorAssignedCategory);

      if (vendorAssignedCategory && !isEditMode) {
        setForm((prev) => ({ ...prev, category: vendorAssignedCategory }));
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/api/vendor/products/${id}`);
      const product = res.data.product || res.data;

      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        // Keep images empty in edit mode, user must re-upload files
        images: '',
        isFeatured: product.isFeatured || false,
        specifications:
          product.specifications && product.specifications.length > 0
            ? product.specifications.map((s) => ({
              key: s.key || '',
              value: s.value || '',
            }))
            : [{ key: '', value: '' }],
      });
    } catch (error) {
      toast.error('Failed to load product details');
      navigate('/vendor/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecChange = (index, field, value) => {
    setForm((prev) => {
      const updatedSpecs = [...prev.specifications];
      updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
      return { ...prev, specifications: updatedSpecs };
    });
  };

  const addSpecRow = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecRow = (index) => {
    if (form.specifications.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = 'Valid price is required';
    if (form.comparePrice && (isNaN(Number(form.comparePrice)) || Number(form.comparePrice) <= 0))
      newErrors.comparePrice = 'Compare price must be a valid positive number';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      newErrors.stock = 'Valid stock quantity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Basic Information
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', Number(form.price)); // Convert to number
      formData.append('category', form.category);
      formData.append('stock', Number(form.stock)); // Convert to number
      formData.append('isFeatured', form.isFeatured);

      // Optional fields
      if (form.comparePrice) formData.append('comparePrice', Number(form.comparePrice));
      if (form.subcategory) formData.append('subcategory', form.subcategory);
      if (form.brand) formData.append('brand', form.brand);

      // Specifications (Stringify for Backend)
      const filteredSpecs = form.specifications.filter((s) => s.key.trim() && s.value.trim());
      formData.append('specifications', JSON.stringify(filteredSpecs));

      // Image Handling
      // Note: Your backend expects 'image' (single) as per: upload.single("image")
      // Change this line in your handleSubmit:
      if (form.images && form.images.length > 0) {
        formData.append('image', form.images[0]); // Changed 'images' to 'image'
      }
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (isEditMode) {
        await API.patch(`/api/vendor/products/${id}`, formData, config);
        toast.success('Product updated successfully');
      } else {
        await API.post('/api/vendor/add-product', formData, config);
        toast.success('Product created successfully');
      }

      navigate('/vendor/products');
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = assignedCategory
    ? categories.filter((category) => category.name === assignedCategory)
    : categories;

  if (loading) {
    return (
      <DashboardLayout role="Vendor" activePage="Add Product">
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
          <p>Loading product...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Vendor" activePage="Add Product">
      <div className="vendor-add-product">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button
              className="btn-back"
              onClick={() => navigate('/vendor/products')}
              type="button"
            >
              <HiOutlineArrowLeft /> Back
            </button>
            <div>
              <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
              <p className="text-muted">
                {isEditMode ? 'Update product information' : 'Fill in the details to add a new product'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="product-form" noValidate>
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              {/* Basic Info Card */}
              <div className="form-card">
                <h2 className="form-card-title">Basic Information</h2>

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Product Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    className={`form-input form-textarea ${errors.description ? 'form-input-error' : ''}`}
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <span className="form-error">{errors.description}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={`form-input form-select ${errors.category ? 'form-input-error' : ''}`}
                      disabled={Boolean(assignedCategory) && !isEditMode}
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {formatCategoryLabel(cat.name)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="form-error">{errors.category}</span>
                    )}
                    {assignedCategory && !isEditMode ? (
                      <span className="form-hint">
                        Your vendor account is assigned to {formatCategoryLabel(assignedCategory)}.
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subcategory" className="form-label">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      id="subcategory"
                      name="subcategory"
                      value={form.subcategory}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g., Smartphones"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="brand" className="form-label">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              {/* Specifications Card */}
              <div className="form-card">
                <h2 className="form-card-title">Specifications</h2>
                <p className="form-card-desc">
                  Add key-value pairs for product specifications (e.g., Color: Red, Weight: 200g)
                </p>

                <div className="specs-list">
                  {form.specifications.map((spec, index) => (
                    <div className="spec-row" key={index}>
                      <input
                        type="text"
                        placeholder="Key (e.g., Weight)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        className="form-input spec-input"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g., 200g)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="form-input spec-input"
                      />
                      <button
                        type="button"
                        className="btn-icon btn-remove-spec"
                        onClick={() => removeSpecRow(index)}
                        disabled={form.specifications.length <= 1}
                        title="Remove specification"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="btn btn-add-spec" onClick={addSpecRow}>
                  <HiOutlinePlus /> Add Specification
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              {/* Pricing Card */}
              <div className="form-card">
                <h2 className="form-card-title">Pricing & Inventory</h2>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    Selling Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`form-input ${errors.price ? 'form-input-error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="comparePrice" className="form-label">
                    Compare Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    id="comparePrice"
                    name="comparePrice"
                    value={form.comparePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`form-input ${errors.comparePrice ? 'form-input-error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.comparePrice && (
                    <span className="form-error">{errors.comparePrice}</span>
                  )}
                  <span className="form-hint">
                    Original price shown with a strikethrough to highlight the discount
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">
                    Stock Quantity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    className={`form-input ${errors.stock ? 'form-input-error' : ''}`}
                    placeholder="0"
                  />
                  {errors.stock && <span className="form-error">{errors.stock}</span>}
                </div>

                {/* Discount Preview */}
                {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
                  <div className="discount-preview">
                    You're offering a{' '}
                    <strong>
                      {Math.round(
                        ((Number(form.comparePrice) - Number(form.price)) /
                          Number(form.comparePrice)) *
                        100
                      )}
                      % discount
                    </strong>{' '}
                    (Save ₹
                    {(Number(form.comparePrice) - Number(form.price)).toLocaleString('en-IN')})
                  </div>
                )}
              </div>

              {/* Images Card */}
              <div className="form-card">
                <h2 className="form-card-title">Product Images</h2>
                <div className="form-group">
                  <label htmlFor="images" className="form-label">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        images: e.target.files,
                      }))
                    }
                  />
                  <span className="form-hint">
                    Select multiple images from your computer. The first image will be used as the main thumbnail.
                  </span>
                </div>

                {/* ✅ FIXED IMAGE PREVIEW LOGIC */}
                {form.images && form.images.length > 0 && (
                  <div className="image-previews">
                    {Array.from(form.images).map((file, idx) => (
                      <div className="image-preview" key={idx}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          onError={(e) => {
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility Card */}
              <div className="form-card">
                <h2 className="form-card-title">Visibility</h2>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom" />
                  <span>Mark as Featured Product</span>
                </label>
                <span className="form-hint" style={{ marginTop: '0.5rem', display: 'block' }}>
                  Featured products are highlighted on the homepage and category pages.
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate('/vendor/products')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="submit-spinner" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Product'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .vendor-add-product { max-width: 1200px; }
        .page-header { margin-bottom: 1.5rem; }
        .header-left { display: flex; align-items: flex-start; gap: 1rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: #1a1a2e; }
        .page-header .text-muted { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.25rem;
        }
        .btn-back:hover { border-color: #6366f1; color: #6366f1; }
        .btn-back svg { width: 16px; height: 16px; }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #f0f0f0;
          margin-bottom: 1.5rem;
        }
        .form-card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #1a1a2e;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
        }
        .form-card-desc {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0 0 1rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group:last-child {
          margin-bottom: 0;
        }
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.4rem;
        }
        .required {
          color: #ef4444;
        }
        .form-input {
          width: 100%;
          padding: 0.65rem 0.9rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #1a1a2e;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .form-input-error {
          border-color: #ef4444;
        }
        .form-input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.9rem center;
          padding-right: 2.5rem;
          cursor: pointer;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-error {
          display: block;
          font-size: 0.8rem;
          color: #ef4444;
          margin-top: 0.3rem;
        }
        .form-hint {
          display: block;
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 0.3rem;
        }

        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .spec-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .spec-input {
          flex: 1;
        }
        .btn-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
          flex-shrink: 0;
        }
        .btn-icon svg { width: 16px; height: 16px; }
        .btn-icon:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-icon:disabled:hover { border-color: #e5e7eb; color: #374151; background: #fff; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn svg { width: 16px; height: 16px; }
        .btn-primary { background: #6366f1; color: #fff; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-add-spec { background: transparent; color: #6366f1; border: 1px dashed #6366f1; padding: 0.5rem 1rem; }
        .btn-add-spec:hover { background: #eef2ff; }

        .discount-preview {
          padding: 0.75rem 1rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #065f46;
        }

        .image-previews {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }
        .image-preview {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #374151;
        }
        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
          position: relative;
        }
        .checkbox-input:checked + .checkbox-custom {
          background: #6366f1;
          border-color: #6366f1;
        }
        .checkbox-input:checked + .checkbox-custom::after {
          content: '';
          width: 6px;
          height: 10px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          position: absolute;
          top: 2px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.5rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #f0f0f0;
        }
        .btn-cancel {
          background: #fff;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        .btn-cancel:hover { background: #f9fafb; }
        .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-submit {
          padding: 0.7rem 2rem;
          font-size: 0.95rem;
        }
        .submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .text-muted { color: #6b7280; }

        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column-reverse;
          }
          .form-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default VendorAddProduct;
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   HiOutlinePlus,
//   HiOutlineTrash,
//   HiOutlineArrowLeft,
// } from 'react-icons/hi';
// import toast from 'react-hot-toast';
// import API from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import DashboardLayout from '../components/DashboardLayout';

// const CATEGORIES = [
//   'Electronics',
//   'Clothing',
//   'Home & Kitchen',
//   'Books',
//   'Sports',
//   'Beauty',
//   'Toys',
//   'Accessories',
//   'Footwear',
//   'Groceries',
// ];

// const initialFormState = {
//   name: '',
//   description: '',
//   price: '',
//   comparePrice: '',
//   category: '',
//   subcategory: '',
//   brand: '',
//   stock: '',
//   images: '',
//   isFeatured: false,
//   specifications: [{ key: '', value: '' }],
// };

// const VendorAddProduct = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const isEditMode = Boolean(id);

//   const [form, setForm] = useState(initialFormState);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(isEditMode);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (isEditMode) {
//       fetchProduct();
//     }
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       const res = await API.get(`/api/products/${id}`);
//       const product = res.data.product || res.data;
//       setForm({
//         name: product.name || '',
//         description: product.description || '',
//         price: product.price?.toString() || '',
//         comparePrice: product.comparePrice?.toString() || '',
//         category: product.category || '',
//         subcategory: product.subcategory || '',
//         brand: product.brand || '',
//         stock: product.stock?.toString() || '',
//         images: Array.isArray(product.images) ? product.images.join(', ') : product.images || '',
//         isFeatured: product.isFeatured || false,
//         specifications:
//           product.specifications && product.specifications.length > 0
//             ? product.specifications.map((s) => ({
//               key: s.key || '',
//               value: s.value || '',
//             }))
//             : [{ key: '', value: '' }],
//       });
//     } catch (error) {
//       toast.error('Failed to load product details');
//       navigate('/vendor/products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleSpecChange = (index, field, value) => {
//     setForm((prev) => {
//       const updatedSpecs = [...prev.specifications];
//       updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
//       return { ...prev, specifications: updatedSpecs };
//     });
//   };

//   const addSpecRow = () => {
//     setForm((prev) => ({
//       ...prev,
//       specifications: [...prev.specifications, { key: '', value: '' }],
//     }));
//   };

//   const removeSpecRow = (index) => {
//     if (form.specifications.length <= 1) return;
//     setForm((prev) => ({
//       ...prev,
//       specifications: prev.specifications.filter((_, i) => i !== index),
//     }));
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!form.name.trim()) newErrors.name = 'Product name is required';
//     if (!form.description.trim()) newErrors.description = 'Description is required';
//     if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
//       newErrors.price = 'Valid price is required';
//     if (form.comparePrice && (isNaN(Number(form.comparePrice)) || Number(form.comparePrice) <= 0))
//       newErrors.comparePrice = 'Compare price must be a valid positive number';
//     if (!form.category) newErrors.category = 'Category is required';
//     if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
//       newErrors.stock = 'Valid stock quantity is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!validate()) return;

//   setSubmitting(true);

//   try {
//     const formData = new FormData();

//     formData.append('name', form.name);
//     formData.append('description', form.description);
//     formData.append('price', form.price);
//     formData.append('comparePrice', form.comparePrice);
//     formData.append('category', form.category);
//     formData.append('subcategory', form.subcategory);
//     formData.append('brand', form.brand);
//     formData.append('stock', form.stock);
//     formData.append('isFeatured', form.isFeatured);
//     formData.append('vendorId', user._id);

//     // ✅ specs
//     formData.append(
//       'specifications',
//       JSON.stringify(
//         form.specifications.filter(
//           (s) => s.key.trim() && s.value.trim()
//         )
//       )
//     );

//     // ✅ images
//     if (form.images) {
//       for (let i = 0; i < form.images.length; i++) {
//         formData.append('images', form.images[i]);
//       }
//     }

//     if (isEditMode) {
//       await API.put(`/api/products/${id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       toast.success('Product updated');
//     } else {
//       await API.post('/api/products', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       toast.success('Product created');
//     }

//     navigate('/vendor/products');
//   } catch (error) {
//     console.error(error);
//     toast.error('Upload failed');
//   } finally {
//     setSubmitting(false);
//   }
// };
//   if (loading) {
//     return (
//       <DashboardLayout role="Vendor" activePage="Add Product">
//         <div className="loading-spinner-container">
//           <div className="loading-spinner" />
//           <p>Loading product...</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout role="Vendor" activePage="Add Product">
//       <div className="vendor-add-product">
//         {/* Header */}
//         <div className="page-header">
//           <div className="header-left">
//             <button
//               className="btn-back"
//               onClick={() => navigate('/vendor/products')}
//               type="button"
//             >
//               <HiOutlineArrowLeft /> Back
//             </button>
//             <div>
//               <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
//               <p className="text-muted">
//                 {isEditMode ? 'Update product information' : 'Fill in the details to add a new product'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="product-form" noValidate>
//           <div className="form-grid">
//             {/* Left Column */}
//             <div className="form-column">
//               {/* Basic Info Card */}
//               <div className="form-card">
//                 <h2 className="form-card-title">Basic Information</h2>

//                 <div className="form-group">
//                   <label htmlFor="name" className="form-label">
//                     Product Name <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={form.name}
//                     onChange={handleChange}
//                     className={`form-input ${errors.name ? 'form-input-error' : ''}`}
//                     placeholder="Enter product name"
//                   />
//                   {errors.name && <span className="form-error">{errors.name}</span>}
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="description" className="form-label">
//                     Description <span className="required">*</span>
//                   </label>
//                   <textarea
//                     id="description"
//                     name="description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={5}
//                     className={`form-input form-textarea ${errors.description ? 'form-input-error' : ''}`}
//                     placeholder="Enter product description"
//                   />
//                   {errors.description && (
//                     <span className="form-error">{errors.description}</span>
//                   )}
//                 </div>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label htmlFor="category" className="form-label">
//                       Category <span className="required">*</span>
//                     </label>
//                     <select
//                       id="category"
//                       name="category"
//                       value={form.category}
//                       onChange={handleChange}
//                       className={`form-input form-select ${errors.category ? 'form-input-error' : ''}`}
//                     >
//                       <option value="">Select category</option>
//                       {CATEGORIES.map((cat) => (
//                         <option key={cat} value={cat}>
//                           {cat}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.category && (
//                       <span className="form-error">{errors.category}</span>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="subcategory" className="form-label">
//                       Subcategory
//                     </label>
//                     <input
//                       type="text"
//                       id="subcategory"
//                       name="subcategory"
//                       value={form.subcategory}
//                       onChange={handleChange}
//                       className="form-input"
//                       placeholder="e.g., Smartphones"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="brand" className="form-label">
//                     Brand
//                   </label>
//                   <input
//                     type="text"
//                     id="brand"
//                     name="brand"
//                     value={form.brand}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Enter brand name"
//                   />
//                 </div>
//               </div>

//               {/* Specifications Card */}
//               <div className="form-card">
//                 <h2 className="form-card-title">Specifications</h2>
//                 <p className="form-card-desc">
//                   Add key-value pairs for product specifications (e.g., Color: Red, Weight: 200g)
//                 </p>

//                 <div className="specs-list">
//                   {form.specifications.map((spec, index) => (
//                     <div className="spec-row" key={index}>
//                       <input
//                         type="text"
//                         placeholder="Key (e.g., Weight)"
//                         value={spec.key}
//                         onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
//                         className="form-input spec-input"
//                       />
//                       <input
//                         type="text"
//                         placeholder="Value (e.g., 200g)"
//                         value={spec.value}
//                         onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
//                         className="form-input spec-input"
//                       />
//                       <button
//                         type="button"
//                         className="btn-icon btn-remove-spec"
//                         onClick={() => removeSpecRow(index)}
//                         disabled={form.specifications.length <= 1}
//                         title="Remove specification"
//                       >
//                         <HiOutlineTrash />
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 <button type="button" className="btn btn-add-spec" onClick={addSpecRow}>
//                   <HiOutlinePlus /> Add Specification
//                 </button>
//               </div>
//             </div>

//             {/* Right Column */}
//             <div className="form-column">
//               {/* Pricing Card */}
//               <div className="form-card">
//                 <h2 className="form-card-title">Pricing & Inventory</h2>

//                 <div className="form-group">
//                   <label htmlFor="price" className="form-label">
//                     Selling Price (₹) <span className="required">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     id="price"
//                     name="price"
//                     value={form.price}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                     className={`form-input ${errors.price ? 'form-input-error' : ''}`}
//                     placeholder="0.00"
//                   />
//                   {errors.price && <span className="form-error">{errors.price}</span>}
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="comparePrice" className="form-label">
//                     Compare Price / MRP (₹)
//                   </label>
//                   <input
//                     type="number"
//                     id="comparePrice"
//                     name="comparePrice"
//                     value={form.comparePrice}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                     className={`form-input ${errors.comparePrice ? 'form-input-error' : ''}`}
//                     placeholder="0.00"
//                   />
//                   {errors.comparePrice && (
//                     <span className="form-error">{errors.comparePrice}</span>
//                   )}
//                   <span className="form-hint">
//                     Original price shown with a strikethrough to highlight the discount
//                   </span>
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="stock" className="form-label">
//                     Stock Quantity <span className="required">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     id="stock"
//                     name="stock"
//                     value={form.stock}
//                     onChange={handleChange}
//                     min="0"
//                     className={`form-input ${errors.stock ? 'form-input-error' : ''}`}
//                     placeholder="0"
//                   />
//                   {errors.stock && <span className="form-error">{errors.stock}</span>}
//                 </div>

//                 {/* Discount Preview */}
//                 {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
//                   <div className="discount-preview">
//                     You're offering a{' '}
//                     <strong>
//                       {Math.round(
//                         ((Number(form.comparePrice) - Number(form.price)) /
//                           Number(form.comparePrice)) *
//                         100
//                       )}
//                       % discount
//                     </strong>{' '}
//                     (Save ₹
//                     {(Number(form.comparePrice) - Number(form.price)).toLocaleString('en-IN')})
//                   </div>
//                 )}
//               </div>

//               {/* Images Card */}
//               <div className="form-card">
//                 <h2 className="form-card-title">Product Images</h2>
//                 <div className="form-group">
//                   <label htmlFor="images" className="form-label">
//                     Image URLs
//                   </label>
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     onChange={(e) =>
//                       setForm((prev) => ({
//                         ...prev,
//                         images: e.target.files,
//                       }))
//                     }
//                   />
//                   <span className="form-hint">
//                     Separate multiple image URLs with commas. First image will be used as the main
//                     thumbnail.
//                   </span>
//                 </div>

//                 {/* Image Preview */}
//                 {form.images && (
//                   <div className="image-previews">
//                     {form.images
//                       .split(',')
//                       .map((url) => url.trim())
//                       .filter(Boolean)
//                       .map((url, idx) => (
//                         <div className="image-preview" key={idx}>
//                           <img
//                             src={url}
//                             alt={`Preview ${idx + 1}`}
//                             onError={(e) => {
//                               e.target.parentElement.style.display = 'none';
//                             }}
//                           />
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </div>

//               {/* Visibility Card */}
//               <div className="form-card">
//                 <h2 className="form-card-title">Visibility</h2>
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     name="isFeatured"
//                     checked={form.isFeatured}
//                     onChange={handleChange}
//                     className="checkbox-input"
//                   />
//                   <span className="checkbox-custom" />
//                   <span>Mark as Featured Product</span>
//                 </label>
//                 <span className="form-hint" style={{ marginTop: '0.5rem', display: 'block' }}>
//                   Featured products are highlighted on the homepage and category pages.
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="form-actions">
//             <button
//               type="button"
//               className="btn btn-cancel"
//               onClick={() => navigate('/vendor/products')}
//               disabled={submitting}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="btn btn-primary btn-submit"
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <>
//                   <span className="submit-spinner" />
//                   {isEditMode ? 'Updating...' : 'Creating...'}
//                 </>
//               ) : isEditMode ? (
//                 'Update Product'
//               ) : (
//                 'Add Product'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style>{`
//         .vendor-add-product { max-width: 1200px; }
//         .page-header { margin-bottom: 1.5rem; }
//         .header-left { display: flex; align-items: flex-start; gap: 1rem; }
//         .page-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: #1a1a2e; }
//         .page-header .text-muted { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }

//         .btn-back {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.35rem;
//           padding: 0.5rem 0.75rem;
//           border-radius: 8px;
//           border: 1px solid #e5e7eb;
//           background: #fff;
//           color: #374151;
//           font-size: 0.85rem;
//           cursor: pointer;
//           transition: all 0.2s;
//           margin-top: 0.25rem;
//         }
//         .btn-back:hover { border-color: #6366f1; color: #6366f1; }
//         .btn-back svg { width: 16px; height: 16px; }

//         .form-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1.5rem;
//           margin-bottom: 1.5rem;
//         }

//         .form-card {
//           background: #fff;
//           border-radius: 12px;
//           padding: 1.5rem;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
//           margin-bottom: 1.5rem;
//         }
//         .form-card-title {
//           font-size: 1.1rem;
//           font-weight: 600;
//           margin: 0 0 1rem;
//           color: #1a1a2e;
//           padding-bottom: 0.75rem;
//           border-bottom: 1px solid #f0f0f0;
//         }
//         .form-card-desc {
//           font-size: 0.85rem;
//           color: #6b7280;
//           margin: 0 0 1rem;
//         }

//         .form-group {
//           margin-bottom: 1.25rem;
//         }
//         .form-group:last-child {
//           margin-bottom: 0;
//         }
//         .form-label {
//           display: block;
//           font-size: 0.85rem;
//           font-weight: 500;
//           color: #374151;
//           margin-bottom: 0.4rem;
//         }
//         .required {
//           color: #ef4444;
//         }
//         .form-input {
//           width: 100%;
//           padding: 0.65rem 0.9rem;
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           color: #1a1a2e;
//           background: #fff;
//           outline: none;
//           transition: border-color 0.2s, box-shadow 0.2s;
//           box-sizing: border-box;
//         }
//         .form-input:focus {
//           border-color: #6366f1;
//           box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
//         }
//         .form-input-error {
//           border-color: #ef4444;
//         }
//         .form-input-error:focus {
//           box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
//         }
//         .form-textarea {
//           resize: vertical;
//           min-height: 80px;
//           font-family: inherit;
//         }
//         .form-select {
//           appearance: none;
//           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
//           background-repeat: no-repeat;
//           background-position: right 0.9rem center;
//           padding-right: 2.5rem;
//           cursor: pointer;
//         }
//         .form-row {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1rem;
//         }
//         .form-error {
//           display: block;
//           font-size: 0.8rem;
//           color: #ef4444;
//           margin-top: 0.3rem;
//         }
//         .form-hint {
//           display: block;
//           font-size: 0.8rem;
//           color: #9ca3af;
//           margin-top: 0.3rem;
//         }

//         .specs-list {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//           margin-bottom: 0.75rem;
//         }
//         .spec-row {
//           display: flex;
//           gap: 0.5rem;
//           align-items: center;
//         }
//         .spec-input {
//           flex: 1;
//         }
//         .btn-icon {
//           width: 36px;
//           height: 36px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 8px;
//           border: 1px solid #e5e7eb;
//           background: #fff;
//           cursor: pointer;
//           transition: all 0.2s;
//           color: #374151;
//           flex-shrink: 0;
//         }
//         .btn-icon svg { width: 16px; height: 16px; }
//         .btn-icon:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
//         .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
//         .btn-icon:disabled:hover { border-color: #e5e7eb; color: #374151; background: #fff; }

//         .btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.625rem 1.25rem;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s;
//         }
//         .btn svg { width: 16px; height: 16px; }
//         .btn-primary { background: #6366f1; color: #fff; }
//         .btn-primary:hover { background: #4f46e5; }
//         .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
//         .btn-add-spec { background: transparent; color: #6366f1; border: 1px dashed #6366f1; padding: 0.5rem 1rem; }
//         .btn-add-spec:hover { background: #eef2ff; }

//         .discount-preview {
//           padding: 0.75rem 1rem;
//           background: #ecfdf5;
//           border: 1px solid #a7f3d0;
//           border-radius: 8px;
//           font-size: 0.85rem;
//           color: #065f46;
//         }

//         .image-previews {
//           display: flex;
//           gap: 0.75rem;
//           flex-wrap: wrap;
//           margin-top: 0.75rem;
//         }
//         .image-preview {
//           width: 80px;
//           height: 80px;
//           border-radius: 8px;
//           overflow: hidden;
//           border: 1px solid #e5e7eb;
//         }
//         .image-preview img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .checkbox-label {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           cursor: pointer;
//           font-size: 0.9rem;
//           color: #374151;
//         }
//         .checkbox-input {
//           position: absolute;
//           opacity: 0;
//           width: 0;
//           height: 0;
//         }
//         .checkbox-custom {
//           width: 20px;
//           height: 20px;
//           border: 2px solid #d1d5db;
//           border-radius: 4px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s;
//           flex-shrink: 0;
//           position: relative;
//         }
//         .checkbox-input:checked + .checkbox-custom {
//           background: #6366f1;
//           border-color: #6366f1;
//         }
//         .checkbox-input:checked + .checkbox-custom::after {
//           content: '';
//           width: 6px;
//           height: 10px;
//           border: solid #fff;
//           border-width: 0 2px 2px 0;
//           transform: rotate(45deg);
//           position: absolute;
//           top: 2px;
//         }

//         .form-actions {
//           display: flex;
//           justify-content: flex-end;
//           gap: 0.75rem;
//           padding: 1.5rem;
//           background: #fff;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
//         }
//         .btn-cancel {
//           background: #fff;
//           color: #374151;
//           border: 1px solid #e5e7eb;
//         }
//         .btn-cancel:hover { background: #f9fafb; }
//         .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
//         .btn-submit {
//           padding: 0.7rem 2rem;
//           font-size: 0.95rem;
//         }
//         .submit-spinner {
//           width: 16px;
//           height: 16px;
//           border: 2px solid rgba(255,255,255,0.3);
//           border-top-color: #fff;
//           border-radius: 50%;
//           animation: spin 0.6s linear infinite;
//           display: inline-block;
//         }

//         .loading-spinner-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 4rem;
//           color: #6b7280;
//         }
//         .loading-spinner {
//           width: 40px;
//           height: 40px;
//           border: 3px solid #e5e7eb;
//           border-top-color: #6366f1;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//           margin-bottom: 1rem;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }
//         .text-muted { color: #6b7280; }

//         @media (max-width: 900px) {
//           .form-grid {
//             grid-template-columns: 1fr;
//           }
//           .form-row {
//             grid-template-columns: 1fr;
//           }
//         }
//         @media (max-width: 640px) {
//           .form-actions {
//             flex-direction: column-reverse;
//           }
//           .form-actions .btn {
//             width: 100%;
//             justify-content: center;
//           }
//         }
//       `}</style>
//     </DashboardLayout>
//   );
// };

// export default VendorAddProduct;
