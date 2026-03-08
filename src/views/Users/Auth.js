/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { Search, Trash2, AlertTriangle, Edit, Plus } from "lucide-react";
import ExportButton from "../ExportButton";
import { deleteRequest, getRequest } from "../../Helpers";
import toast from "react-hot-toast";
import { Empty, Pagination, Spin, Tooltip } from "antd";
import moment from "moment";
import AuthFilter from "./AuthFilter";
import AuthModal from "./AuthModal";

const Auth = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = React.useState({});
  const [filters, setFilters] = useState({ accountType: "" });
  const [tempFilters, setTempFilters] = useState(filters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleAddress = (id) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format("DD-MM-YYYY") : "N/A";
  };

  // Fetch Users
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
      ...filters,
    }).toString();
    getRequest(`auth/getAllusers?${query}`)
      .then((res) => {
        const responseData = res?.data?.data;
        setData(responseData?.users || []);
        setTotal(responseData?.totalUsers || 0);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, [page, limit, searchTerm, sortBy, filters, updateStatus]);

  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(1); // reset page
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      accountType: "",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setPage(1);
    setSearchTerm("");
  };
  // Delete handler
  const confirmDelete = () => {
    if (!selectedItem?._id) return toast.error("No user selected");

    deleteRequest(`auth/delete/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message || "User deleted successfully");
        setSelectedItem(null);
        setUpdateStatus((prev) => !prev);
        setShowDeleteModal(false);
      })
      .catch((error) => {
        console.error("Delete error:", error);
        toast.error("Failed to delete user");
      });
  };

  // Format data for Excel Export
  const exportData = data.map((item, index) => ({
    "Sr No": (page - 1) * limit + (index + 1),
    Name: item?.name || "N/A",
    Phone: item?.phone || "N/A",
    Email: item?.email || "N/A",
    Gender: item?.gender || "N/A",
    Occupation: item?.occupation || "N/A",
    Address: item?.address || "N/A",
  }));

  return (
    <div className="bg-white">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.name || "this user"}</strong>?
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
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded"
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
            Smart Collect Users
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and organize all registered contributors in the Smart Collect
            system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ExportButton
            data={exportData}
            fileName="SmartCollectUsers.xlsx"
            sheetName="Users"
          />

          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <AuthFilter
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
              Loading Users...
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Empty description="No records found" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3">Sr. No.</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Occupation</th>
                  {/* <th className="px-6 py-3">Role</th> */}
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * limit + (index + 1)}
                    </td>

                    {/* Profile + Name + Phone + Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item?.profilepic ? (
                          <img
                            src={item.profilepic}
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                            {item?.name?.charAt(0)}
                          </div>
                        )}

                        <div>
                          <div className="font-medium text-gray-900">
                            {item?.name || "N/A"}
                          </div>

                          <div className="text-sm text-gray-500">
                            {item?.phone || "N/A"}
                          </div>

                          <div className="text-sm text-gray-500">
                            {item?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{item?.gender || "N/A"}</td>

                    <td className="px-6 py-4">{item?.occupation || "N/A"}</td>

                    {/* <td className="px-6 py-4">{item?.role || "N/A"}</td> */}

                    <td className="px-6 py-4">
                      <Tooltip title={item?.address}>
                        <span className="truncate block max-w-xs">
                          {item?.address || "-"}
                        </span>
                      </Tooltip>
                    </td>

                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      {/* Pagination */}
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
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <AuthModal
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

export default Auth;
