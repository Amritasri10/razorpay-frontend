/* eslint-disable react/prop-types */
import { Modal } from "antd";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  postRequest,
  putRequest,
  fileUpload,
  patchRequest,
} from "../../Helpers";

const AuthModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "User",
    gender: "",
    address: "",
    profilePic: "",
    occupation: "",
  });

  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || "",
        phone: modalData.phone || "",
        email: modalData.email || "",
        role: modalData.role || "User",
        gender: modalData.gender || "",
        address: modalData.address || "",
        profilePic: modalData.profilePic || "",
        occupation: modalData.occupation || "",
      });
    }
  }, [modalData]);

  const handleCancel = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      role: "User",
      gender: "",
      address: "",
      profilePic: "",
      occupation: "",
    });
    setErrors({});
    setModalData(null);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers for phone and limit to 10 digits
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    fileUpload({
      url: "upload/uploadImage",
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res?.data?.data?.imageUrl;
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, profilePic: uploadedUrl }));
          toast.success("Image uploaded successfully");
        }
      })
      .catch(() => toast.error("Image upload failed"))
      .finally(() => setLoading(false));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePic: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (formData.phone.length < 10)
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    // if (!modalData && !formData.password)
    //   newErrors.password = 'Password is required'
    // setErrors(newErrors)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const request = modalData
      ? patchRequest({
          url: `auth/update/${modalData._id}`,
          cred: formData,
        })
      : postRequest({
          url: `auth/createUser`,
          cred: formData,
        });

    request
      .then((res) => {
        toast.success(res?.data?.message || "Success");
        setUpdateStatus((prev) => !prev);
        handleCancel();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={modalData ? "Edit User" : "Add User"}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={700}
    >
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Name */}
          <div className="col-12 col-md-6">
            <label htmlFor="name" className="form-label fw-bold">
              Name <span style={{ color: "red" }}>*</span>
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter full name"
              className={`form-control ${errors.name && "is-invalid"}`}
              value={formData.name}
              onChange={handleChange}
            />

            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>
          {/* Phone */}
          <div className="col-12 col-md-6">
            <label htmlFor="phone" className="form-label fw-bold">
              Phone <span style={{ color: "red" }}>*</span>
            </label>

            <input
              id="phone"
              type="text"
              name="phone"
              placeholder="Enter 10 digit phone number"
              className={`form-control ${errors.phone && "is-invalid"}`}
              value={formData.phone}
              onChange={handleChange}
            />

            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>

          {/* Email */}
          <div className="col-12 col-md-6">
            <label htmlFor="email" className="form-label fw-bold">
              Email <span style={{ color: "red" }}>*</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email address"
              className={`form-control ${errors.email && "is-invalid"}`}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          {/* <div className="col-12 col-md-6">
            <label htmlFor="role" className="form-label fw-bold">
              Role
            </label>

            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="User">User</option>
            </select>
          </div> */}

          {/* Gender */}
          <div className="col-12 col-md-6">
            <label htmlFor="gender" className="form-label fw-bold">
              Gender
            </label>

            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          {/* Occupation */}
          <div className="col-12 col-md-6">
            <label htmlFor="occupation" className="form-label fw-bold">
              Occupation
            </label>

            <input
              id="occupation"
              type="text"
              name="occupation"
              placeholder="Enter occupation"
              className="form-control"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>

          {/* Profile Upload */}
          <div className="col-12 col-md-6">
            <label htmlFor="profilePic" className="form-label fw-bold">
              Profile Image
            </label>

            <div className="d-flex align-items-center gap-2">
              <input
                id="profilePic"
                type="file"
                className="form-control"
                onChange={handleImageUpload}
                disabled={loading}
              />

              {formData.profilePic && (
                <div style={{ position: "relative" }}>
                  <img
                    src={formData.profilePic}
                    alt="Profile Preview"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Address */}
          <div className="col-12 col-md-6">
            <label htmlFor="address" className="form-label fw-bold">
              Address
            </label>

            <textarea
              id="address"
              name="address"
              placeholder="Enter address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-end mt-3">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : modalData ? "Update User" : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
