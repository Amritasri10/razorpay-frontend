import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import useCookie from '../../../Hooks/cookie'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import logo from '../../../assets/smartlogopng.jpg'
import { validateMobile } from '../../../Utils'

const Login = () => {

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { setCookie } = useCookie()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ phone: '1111111111', password: 'Admin@1234', })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: validateMobile(value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}auth/loginWithPassword`, formData)
      .then((res) => {

        setCookie('razorPayToken', res?.data?.data?.authToken, 30)

        toast.success(res?.data?.message)

        navigate('/')

        window.location.reload()

      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Login failed')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#000" }}
    >
      <div className="container">

        <div className="row shadow bg-white rounded overflow-hidden">

          {/* LEFT IMAGE */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
            <img
              src={logo}
              alt="login"
              style={{
                width: "70%",
                objectFit: "contain"
              }}
            />
          </div>

          {/* LOGIN FORM */}
          <div className="col-md-6 p-4">

            <div className="text-center mb-4">
              <h3 className="text-black">Login</h3>
            </div>

            <form onSubmit={handleSubmit}>

              {/* PHONE */}
              <div className="mb-3">
                <label className="form-label text-black">
                  Phone Number
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-3 position-relative">

                <label className="form-label text-black">
                  Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "38px",
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="btn w-100 text-white"
                style={{ background: "#75a724" }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Login