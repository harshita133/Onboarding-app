import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert } from 'antd'; // Import Ant Design components

const TableView = ({ tableName }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`/api/getTableData?tableName=${tableName}`);
        const data = await response.json();

        if (response.ok) {
          setTableData(data);
        } else {
          setError(data.error || 'Error fetching table data');
        }
      } catch (error) {
        setError('Error fetching table data');
      } finally {
        setLoading(false);
      }
    };

    if (tableName) {
      fetchTableData();
    }
  }, [tableName]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" /> {/* Loading spinner */}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: '20px' }}
      />
    );
  }

  // Define table columns with scrollable and width-limited columns
  const columns = tableData.length > 0 ? Object.keys(tableData[0]).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize column titles
    dataIndex: key,
    key: key,
    sorter: (a, b) => (typeof a[key] === 'number' ? a[key] - b[key] : a[key].localeCompare(b[key])),
    // Set max width for specific columns
    width: key === 'ip_address' || key === 'email' ? 200 : 'auto',
  })) : [];

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Table: {tableName}</h2>
      {tableData.length > 0 ? (
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={{ pageSize: 5 }} // Pagination with 5 rows per page
          bordered
          scroll={{ x: 'max-content' }} // Enable horizontal scrolling
          rowKey={(record, index) => index}
          style={{ margin: '0 20px' }}
        />
      ) : (
        <p>No data available in this table.</p>
      )}
    </div>
  );
};

export default TableView;
