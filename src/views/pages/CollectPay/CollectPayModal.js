/* eslint-disable react/prop-types */
import { Modal } from "antd";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { postRequest, getRequest } from "../../../Helpers";
import { openRazorpayCheckout } from "../../../Utils/razorpayPayment";
const CollectPayModal = ({
  isModalOpen,
  setIsModalOpen,
}) => {

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])

  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    contributeType: "Donation",
  })

  // fetch users
  useEffect(() => {
    getRequest("auth/getAllusers")
      .then((res) => {
        setUsers(res?.data?.data?.users || [])
      })
      .catch(() => toast.error("Failed to fetch users"))
  }, [])

  const handleCancel = () => {
    setFormData({
      userId: "",
      amount: "",
      contributeType: "Donation",
    })
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

const handleSubmit = (e) => {
  e.preventDefault()

  if (!formData.userId) return toast.error("Please select user")
  if (!formData.amount) return toast.error("Enter amount")

  setLoading(true)

  postRequest({
    url: "order/create-order",
    cred: {
      userId: formData.userId,
      amount: Number(formData.amount),
      contributeType: formData.contributeType,
    },
  })
    .then((res) => {

      toast.success(res?.data?.message || "Order created")

      setFormData({
        userId: "",
        amount: "",
        contributeType: "Donation",
      })

      setIsModalOpen(false)

      // refresh table
      setUpdateStatus(prev => !prev)

    })
    .catch((error) => {
      toast.error(error?.response?.data?.message || "Something went wrong")
    })
    .finally(() => setLoading(false))
}


  return (
    <Modal
      title="Collect Payment"
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={500}
    >
      <form onSubmit={handleSubmit}>
        <div className="row g-3">

          {/* User Select */}
          <div className="col-12">
            <label className="form-label fw-bold">
              User <span style={{ color: "red" }}>*</span>
            </label>

            <select
              name="userId"
              className="form-control"
              value={formData.userId}
              onChange={handleChange}
            >
              <option value="">Select User</option>

              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Contribution Type */}
          <div className="col-12">
            <label className="form-label fw-bold">
              Contribution Type
            </label>

            <select
              name="contributeType"
              className="form-control"
              value={formData.contributeType}
              onChange={handleChange}
            >
              <option value="Donation">Donation</option>
              <option value="Premium">Premium</option>
              <option value="Membership">Membership</option>
            </select>
          </div>

          {/* Amount */}
          <div className="col-12">
            <label className="form-label fw-bold">
              Amount <span style={{ color: "red" }}>*</span>
            </label>

            <input
              type="number"
              name="amount"
              className="form-control"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Payment"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CollectPayModal