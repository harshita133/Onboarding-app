import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Checkbox, Select, Row, Col, Button } from 'antd';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // Import XLSX for handling Excel files
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

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

// Function to handle XLSX or XLS file parsing
const handleParseXLSX = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    callback(worksheet);
  };
  reader.readAsArrayBuffer(file);
};

// Function to auto-detect data type from column data
const detectColumnType = (values) => {
  // Check if all values are boolean
  if (values.every((val) => typeof val === 'string' && ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()))) {
    return 'BOOLEAN';
  }
  // Check if all values are integers
  if (values.every((val) => !isNaN(val) && Number.isInteger(parseFloat(val)))) {
    return 'NUMERIC';
  }
  // Check if all values are numbers (floats included)
  if (values.every((val) => !isNaN(val))) {
    return 'REAL';
  }
  // Check if all values are dates (basic date format check)
  if (values.every((val) => typeof val === 'string' && !isNaN(Date.parse(val)))) {
    return 'DATE';
  }
  // Check if values could be time (basic check for HH:MM:SS format)
  const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
  if (values.every((val) => typeof val === 'string' && timePattern.test(val))) {
    return 'TIMESTAMP';
  }
  // Default to string if none of the above matched
  return 'VARCHAR(1000)';
};

const ThirdOnboardingStep = ({ firstName, previousColumns, previousRows }) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false); // To disable/enable Done button
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const navigate = useNavigate(); // React Router v6 navigate

  // Function to handle parsing the CSV, XLS, or XLSX files
  const handleParseFile = (file) => {
    if (file.type === 'text/csv') {
      // Handle CSV file using PapaParse
      Papa.parse(file, {
        complete: (result) => {
          processParsedData(result.data);
        },
        header: false,
      });
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    ) {
      // Handle XLSX or XLS file using SheetJS (xlsx)
      handleParseXLSX(file, processParsedData);
    } else {
      message.error('Unsupported file format');
    }
  };

  // Function to process parsed data from either CSV or XLSX
  const processParsedData = (data) => {
    if (data && data.length > 1) {
      const firstRow = data[0]; // First row is the header
      const dataRows = data.slice(1); // Remaining rows are data

      // Filter out empty rows
      const filteredDataRows = dataRows.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== '')
      );

      const detectedColumnTypes = {};

      firstRow.forEach((col, index) => {
        const columnValues = filteredDataRows.map((row) => row[index]).filter((val) => val !== undefined && val !== '');
        detectedColumnTypes[col] = {
          addToDatabase: true,
          dbType: detectColumnType(columnValues),
        };
      });

      setColumns(firstRow);
      setSelectedColumns(detectedColumnTypes);
      setParsedData(filteredDataRows); // Store the filtered parsed data
      setLoading(false); // Stop loading after parsing is complete
      validate(firstRow, filteredDataRows);
    }
  };

  const validate = (selectedColumns, selectedParseData) => {
    const isSameHeaders = JSON.stringify(selectedColumns) === JSON.stringify(previousColumns);
    const isSameData = JSON.stringify(selectedParseData) === JSON.stringify(previousRows);
    if (isSameHeaders || isSameData) {
      setErrorMessage('The uploaded file has the same headers and data as the previous file.');
      setIsDisabled(true); // Disable Done button
      return false;
    }
    setErrorMessage(''); // Clear error message
    setIsDisabled(false); // Enable Done button
    return true;
  };

  // Handle the 'Next' button click to send data to parent
  const handleNext = () => {
    if (!fileUrl) {
      navigate(`/dashboard/${firstName}`);
      return;
    }
    const columnsToAdd = Object.keys(selectedColumns)
      .filter((col) => selectedColumns[col].addToDatabase)
      .map((col) => ({
        name: col,
        dbType: selectedColumns[col].dbType,
      }));

    parsedData.pop();

    const payload = {
      tableName: firstName + '_' + fileUrl.name.split('.').slice(0, -1).join('.') + '_2', // Use the file name as the table name
      columns: columnsToAdd,
      data: parsedData,
    };

    // Send POST request with the CSV/XLS/XLSX data to the server
    fetch('http://localhost:5000/api/createTableFromCSV', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        message.success('Table created successfully');
        navigate(`/dashboard/${firstName}`);
      })
      .catch((error) => {
        message.error('Error creating table');
      });
  };

  const handleChange = (info) => {
    const file = info.file.originFileObj;
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    setFileUrl(file);
    handleParseFile(file); // Parse the CSV, XLS, or XLSX file to get the column names and detect types
  };

  const handleCheckboxChange = (columnName, checked) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        addToDatabase: checked, // Update whether the column is selected to add to the DB
      },
    });
  };

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
      <div style={{ marginTop       : '8px' }}>Upload CSV/Excel</div>
    </div>
  );

  // Common data types for the select dropdown
  const dataTypes = ['VARCHAR(1000)', 'CHAR[]', 'NUMERIC', 'NUMERIC[]', 'REAL', 'BOOLEAN', 'DATE', 'TIMESTAMP'];

  return (
    <Row gutter={[16, 16]} justify="center" align="middle">
      <Col xs={24} style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Upload
          name="file"
          className="file-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          maxCount={1}
          onChange={handleChange}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess('ok');
            }, 0);
          }}
        >
          {uploadButton}
        </Upload>
      </Col>

      <Col xs={24} md={12} lg={8} style={{ textAlign: 'center' }}>
        {/* Display CSV or Excel column names with checkboxes and select list for DB types */}
        {columns.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Select Columns to Add to Database and Specify Type:</h3>
            {errorMessage && <p style={{ color: 'red', marginBottom: '20px' }}>{errorMessage}</p>}
            <ul style={{ paddingLeft: '20px', margin: '10px 0', lineHeight: '1.5' }}>
              {columns.map((col, index) => (
                <li
                  key={index}
                  style={{ listStyle: 'none', paddingBottom: '5px', display: 'flex', alignItems: 'center' }}
                >
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
      </Col>

      <Col xs={24} style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button type="primary" onClick={handleNext} disabled={isDisabled}>
          Done
        </Button>
      </Col>
    </Row>
  );
};

export default ThirdOnboardingStep;

