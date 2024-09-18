import React, { useState,useEffect } from 'react';
import { Upload, Button, message, Checkbox, Select, Row, Col,Alert } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';

const { Option } = Select;

const MultiUpload = ({tableNames}) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]); // Store table column names in 2D array
  const [tableData, setTableData] = useState([]); // Store table rows in 2D array
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/getAllTableData?tableNames=${JSON.stringify(tableNames)}`);
        const data = await response.json();

        if (response.ok) {
          setTableColumns(data.columns); // Set the 2D array of columns
          setTableData(data.data); // Set the 2D array of table data
          console.log(data.columns)
          console.log(data.data)

        } else {
          setError(data.error || 'Error fetching table data');
        }
      } catch (error) {
        setError('Error fetching table data');
      } finally {
        setLoading(false);
      }
    };

    if (tableNames && tableNames.length > 0) {
      fetchTableData();
    }
  }, [tableNames]);

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

  // Function to detect the column data types
  const detectColumnType = (values) => {
    if (values.every((val) => ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()))) {
      return 'boolean';
    }
    if (values.every((val) => !isNaN(val) && Number.isInteger(parseFloat(val)))) {
      return 'numeric[]';
    }
    if (values.every((val) => !isNaN(val))) {
      return 'float';
    }
    if (values.every((val) => !isNaN(Date.parse(val)))) {
      return 'date';
    }
    const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    if (values.every((val) => timePattern.test(val))) {
      return 'time';
    }
    return 'varchar(1000)';
  };

  // Function to parse CSV files using PapaParse
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
              addToDatabase: true,
              dbType: detectColumnType(columnValues),
            };
          });

          setColumns(firstRow);
          setSelectedColumns(detectedColumnTypes);
          setParsedData(dataRows); // Store the parsed data
          setLoading(false); // Stop loading after parsing is complete
        }
      },
      header: false,
    });
  };

  // Handle changes in file selection
  const handleUploadChange = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);
    if (file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (file.status === 'removed') {
      // Clear columns and data types when a file is removed
      setColumns([]);
      setSelectedColumns({});
      setParsedData([]);
    } else {
      handleParseCSV(file.originFileObj);
    }
  };

  // Validate file types before upload
  const beforeUpload = (file) => {
    const isCsvOrExcel =
      file.type === 'application/vnd.ms-excel' || // .xls
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
      file.type === 'text/csv'; // .csv

    if (!isCsvOrExcel) {
      message.error('You can only upload CSV, XLS, or XLSX files!');
      return Upload.LIST_IGNORE; // Ignore files that do not match the types
    }

    return true; // Allow valid files to be uploaded
  };

  // Handle checkbox changes for columns
  const handleCheckboxChange = (columnName, checked) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        addToDatabase: checked,
      },
    });
  };

  // Handle data type changes for columns
  const handleDbTypeChange = (columnName, value) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        dbType: value,
      },
    });
  };

  // Handle the 'Start Upload' button click
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('No files selected for upload.');
      return;
    }

    const columnsToAdd = Object.keys(selectedColumns)
      .filter((col) => selectedColumns[col].addToDatabase)
      .map((col) => ({
        name: col,
        dbType: selectedColumns[col].dbType,
      }));

    // Use file name from the first file (for example purposes)
    const tableName = fileList[0].name.split('.').slice(0, -1).join('.');

    const payload = {
      tableName,
      columns: columnsToAdd,
      data: parsedData,
    };

    // Post the payload to your server (implement the logic accordingly)
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
      })
      .catch((error) => {
        message.error('Error creating table');
      });
  };

  // Button for uploading files
  const uploadButton = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        width: 80,
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        border: '1px dashed #d9d9d9',
        cursor: 'pointer',
      }}
    >
      {loading ? <LoadingOutlined style={{ fontSize: 24 }} /> : <UploadOutlined style={{ fontSize: 24 }} />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Data types for columns
  const dataTypes = ['varchar(1000)', 'char[]', 'numeric', 'numeric[]', 'float', 'boolean', 'date', 'time'];


  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Upload
        name="file"
        listType="picture-circle"
        fileList={fileList}
        onChange={handleUploadChange}
        beforeUpload={beforeUpload} // Validate file types only
        accept=".csv,.xls,.xlsx" // Only allow CSV, XLS, and XLSX files in the file picker
        showUploadList={true} // Show the list of uploaded files
        multiple // Allow multiple files to be uploaded
        customRequest={({ onSuccess }) => {
          setTimeout(() => {
            setLoading(false);
            onSuccess("ok");
          }, 1000);
        }}
      >
        {uploadButton}
      </Upload>

      {columns.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Select Columns to Add to Database and Specify Type:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {columns.map((col, index) => (
              <li key={index} style={{ marginBottom: '10px', textAlign: 'left' }}>
                <Checkbox
                  checked={selectedColumns[col]?.addToDatabase}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                />
                <span style={{ marginLeft: '10px', marginRight: '10px' }}>{col}</span>
                {selectedColumns[col]?.addToDatabase && (
                  <Select
                    placeholder="Select DB Type"
                    style={{ width: '200px' }}
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

      <Button
        type="primary"
        onClick={handleUpload}
        style={{ marginTop: '20px' }}
        disabled={fileList.length === 0 || Object.keys(selectedColumns).length === 0} // Disable if no files or columns selected
      >
        Upload
      </Button>
    </div>
  );
};

export default MultiUpload;
