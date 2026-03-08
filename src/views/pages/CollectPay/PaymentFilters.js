/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React from "react";
import { Row, Col, Input, Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

const PaymentFilters = ({
  searchTerm,
  setSearchTerm,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  page,
}) => {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
        Payment Filters
      </h3>

      <Row gutter={[16, 16]} align="bottom">
        
        {/* Search */}
        <Col xs={24} sm={12} md={6}>
          <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
            Search
          </label>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search name / phone..."
            value={searchTerm}
            onChange={(e) => {
              page(1);
              setSearchTerm(e.target.value);
            }}
          />
        </Col>

        {/* Contribution Type */}
        <Col xs={24} sm={12} md={6}>
          <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
            Contribution Type
          </label>

          <Select
            placeholder="Select Type"
            style={{ width: "100%" }}
            value={tempFilters.contributeType}
            onChange={(value) =>
              setTempFilters((prev) => ({
                ...prev,
                contributeType: value,
              }))
            }
            allowClear
          >
            <Option value="Donation">Donation</Option>
            <Option value="Membership">Membership</Option>
            <Option value="Premium">Premium</Option>
          </Select>
        </Col>

        {/* Payment Status */}
        <Col xs={24} sm={12} md={6}>
          <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
            Status
          </label>

          <Select
            placeholder="Select Status"
            style={{ width: "100%" }}
            value={tempFilters.status}
            onChange={(value) =>
              setTempFilters((prev) => ({
                ...prev,
                status: value,
              }))
            }
            allowClear
          >
            <Option value="paid">Paid</Option>
            <Option value="created">Pending</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </Col>

        {/* Buttons */}
        <Col xs={24} sm={24} md={6}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Button type="primary" onClick={applyFilters}>
              Apply
            </Button>

            <Button onClick={resetFilters}>Reset</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentFilters;