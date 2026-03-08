/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Empty, Pagination, Spin } from "antd";
import axios from "axios";
import CollectPayModal from "./CollectPayModal";
import ExportButton from "../../ExportButton";
import { deleteRequest, getRequest, postRequest } from "../../../Helpers";
import PaymentFilters from "./PaymentFilters";
import { openRazorpayCheckout } from "../../../Utils/razorpayPayment";

const CollectPay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [tempFilters, setTempFilters] = useState(filters);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ✅ Fetch  with Pagination + Search
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({
          search: searchTerm,
          page,
          limit,
          ...filters,
        }).toString();

        const res = await getRequest(`order/all-orders?${query}`);

        const responseData = res?.data?.data;

        setData(responseData?.orders || []);
        setTotal(responseData?.totalOrders || []);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit, searchTerm, filters, updateStatus]);

  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {};
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setPage(1);
    setSearchTerm("");
  };

  const handlePay = (order) => {
    const orderData = {
      razorpayOrderId: order?.razorpayOrderId,
      amount: order?.amount,
      currency: "INR",
      contributeType: order?.contributeType,
    };
    openRazorpayCheckout(orderData, handlePaymentSuccess);
  };

  const handlePaymentSuccess = (response) => {
    const payload = {
      razorpayOrderId: response.razorpayOrderId,
      razorpayPaymentId: response.razorpayPaymentId,
      razorpaySignature: response.razorpaySignature,
    };
    postRequest({
      url: "order/payment-verification",
      cred: payload,
    });
    setPaymentLoading(true)
      .then((res) => {
        toast.success(res?.data?.message || "Payment Successful");
        setUpdateStatus((prev) => !prev);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Payment verification failed",
        );
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  // Format data for Excel Export
const exportData = data.map((order, index) => ({
  "Sr No": (page - 1) * limit + (index + 1),
  "User Name": order?.user?.name || "N/A",
  "Phone": order?.user?.phone || "N/A",
  "Contribution": order?.contributeType || "N/A",
  "Amount": order?.amount || 0,
  "Status": order?.status || "N/A",
  "Date": order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString()
    : "N/A",
}));

  // ✅ Delete handler
  const confirmDelete = () => {
    deleteRequest(`order/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message);
        setSelectedItem(null);
        setUpdateStatus((prev) => !prev);
        setShowDeleteModal(false);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  return (
    <div className="bg-white">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
   <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
  <div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
      Smart Collect Payments
    </h2>
    <p className="text-gray-600 text-sm sm:text-base">
      Track and manage user contributions and payment collections.    </p>
  </div>

  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
<ExportButton
  data={exportData}
  fileName="SmartCollectPayments.xlsx"
  sheetName="Payments"
/>


    <button
      onClick={() => {
        setIsModalOpen(true);
      }}
      className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
    >
      <Plus className="w-4 h-4 mr-2" /> Add Payment
    </button>
  </div>
</div>


      {/* Search */}
      <PaymentFilters
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        page={setPage}
      />
      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">
              Loading Orders...
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Empty description="No orders found" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-3">Sr No.</th>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Contribution</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((order, index) => (
                <tr key={order._id}>
                  <td className="px-6 py-4">
                    {(page - 1) * limit + (index + 1)}
                  </td>

                  <td className="px-6 py-4">{order?.user?.name}</td>

                  <td className="px-6 py-4">{order?.user?.phone}</td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {order?.contributeType}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold">₹{order?.amount}</td>

                  <td className="px-6 py-4">
                    {order?.status === "paid" ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        {order?.status}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(order?.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handlePay(order)}
                      disabled={order?.status === "paid" || paymentLoading}
                      className={`px-3 py-1 rounded text-xs text-white 
  ${
    order?.status === "paid"
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
                    >
                      {order?.status === "paid"
                        ? "Paid"
                        : paymentLoading
                          ? "Processing..."
                          : "Pay"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination (only show if there’s data) */}
      {!loading && data?.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} results
            </div>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              pageSizeOptions={[
                "5",
                "10",
                "20",
                "50",
                "100",
                "200",
                "500",
                "1000",
              ]}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={true}
              onShowSizeChange={(current, size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <CollectPayModal
          setUpdateStatus={setUpdateStatus}
          setModalData={setSelectedItem}
          modalData={selectedItem}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default CollectPay;
