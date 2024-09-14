import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, message, Upload, Checkbox, Select } from 'antd';
import Papa from 'papaparse';

const { Option } = Select;

const getBase64 = (file, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(file);
};

// Restrict upload to CSV or spreadsheet file types
const beforeUpload = (file) => {
  const isSpreadsheet =
    file.type === 'text/csv' || // CSV
    file.type === 'application/vnd.ms-excel' || // XLS
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // XLSX

  if (!isSpreadsheet) {
    message.error('You can only upload CSV or Excel files!');
  }
  return isSpreadsheet;
};

// Function to auto-detect data type from column data
const detectColumnType = (values) => {
  // Check if all values are boolean
  if (values.every((val) => ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()))) {
    return 'boolean';
  }

  // Check if all values are integers
  if (values.every((val) => !isNaN(val) && Number.isInteger(parseFloat(val)))) {
    return 'int';
  }

  // Check if all values are numbers (floats included)
  if (values.every((val) => !isNaN(val))) {
    return 'float';
  }

  // Check if all values are dates (basic date format check)
  if (values.every((val) => !isNaN(Date.parse(val)))) {
    return 'date';
  }

  // Check if values could be time (basic check for HH:MM:SS format)
  const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
  if (values.every((val) => timePattern.test(val))) {
    return 'time';
  }

  // Default to string if none of the above matched
  return 'string';
};

const SecondOnboardingStep = () => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});

  // Function to handle parsing the CSV and extracting column names and prefilling data types
  const handleParseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 1) {
          const firstRow = result.data[0]; // First row is the header
          const dataRows = result.data.slice(1); // Remaining rows are data
          const detectedColumnTypes = {};

          firstRow.forEach((col, index) => {
            const columnValues = dataRows.map((row) => row[index]).filter((val) => val !== undefined && val !== '');
            detectedColumnTypes[col] = {
              addToDatabase: true, // Automatically select to add to DB
              dbType: detectColumnType(columnValues), // Detect column type
            };
          });

          setColumns(firstRow);
          setSelectedColumns(detectedColumnTypes);
          setLoading(false); // Stop loading after parsing is complete
        }
      },
      header: false, // We assume the first row is the header (column names)
    });
  };

  const handleChange = (info) => {
    const file = info.file.originFileObj;
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    setFileUrl(file);
    handleParseCSV(file); // Parse the CSV or Excel file to get the column names and detect types
  };

  // Handle checkbox change
  const handleCheckboxChange = (columnName, checked) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        addToDatabase: checked, // Update whether the column is selected to add to the DB
      },
    });
  };

  // Handle database type selection change
  const handleDbTypeChange = (columnName, value) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        dbType: value, // Update the database type with the selected value
      },
    });
  };

  const uploadButton = (
    <div
      style={{
        border: 0,
        background: 'none',
        cursor: 'pointer',
        display: 'inline-block',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '1px dashed #d9d9d9',
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingTop: '30px',
        fontSize: '16px',
        color: '#999',
      }}
    >
      {loading ? <LoadingOutlined style={{ fontSize: 24 }} /> : <PlusOutlined style={{ fontSize: 24 }} />}
      <div style={{ marginTop: 8 }}>Upload CSV/Excel</div>
    </div>
  );

  // Common data types for the select dropdown
  const dataTypes = ['string', 'int', 'float', 'boolean', 'date', 'time'];

  return (
    <Flex gap="middle" wrap>
      <Upload
        name="file"
        className="file-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        maxCount={1}
        onChange={handleChange}
        customRequest={({ file, onSuccess }) => {
          // Simulate a successful upload immediately
          setTimeout(() => {
            onSuccess("ok");
          }, 0);
        }}
      >
        {uploadButton}
      </Upload>

      {/* Display CSV or Excel column names with checkboxes and select list for DB types */}
      {columns.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Select Columns to Add to Database and Specify Type:</h3>
          <ul style={{ paddingLeft: '20px', margin: '10px 0', lineHeight: '1.5' }}>
            {columns.map((col, index) => (
              <li key={index} style={{ listStyle: 'none', paddingBottom: '5px', display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectedColumns[col]?.addToDatabase}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                {col}
                {selectedColumns[col]?.addToDatabase && (
                  <Select
                    placeholder="Select DB Type"
                    style={{ marginLeft: '10px', width: '200px' }}
                    onChange={(value) => handleDbTypeChange(col, value)}
                    value={selectedColumns[col]?.dbType}
                  >
                    {dataTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Flex>
  );
};

export default SecondOnboardingStep;
