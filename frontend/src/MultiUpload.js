import React, { useEffect, useState } from 'react';
import { Upload, Button, message, Checkbox, Select, List } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // Import XLSX for handling Excel files

const { Option } = Select;

const MultiUpload = ({ firstName, tableList, tableColumns, tableData }) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to track uploaded files
  const [tableNames, setTableNames] = useState([]);

  useEffect(() => {
    setUploadedFiles([]); // Clear the uploaded file list when the modal is closed
    const extractedTableNames = tableList?.map((name) => {
      return name.split(`${firstName}_`)[1]; // Use the dynamic firstName variable
    });

    setTableNames(extractedTableNames);
  }, [firstName, tableList]);

  // Function to detect the column data types
  const detectColumnType = (values) => {
    if (
      values.every(
        (val) =>
          typeof val === 'string' &&
          ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase())
      )
    ) {
      return 'BOOLEAN';
    }

    if (values.every((val) => Number.isInteger(parseFloat(val)) && !isNaN(val))) {
      return 'NUMERIC';  // Changed from 'NUMERIC[]' to 'NUMERIC'
    }

    if (values.every((val) => !isNaN(val) && parseFloat(val) % 1 !== 0)) {
      return 'REAL';
    }

    if (values.every((val) => typeof val === 'string' && !isNaN(Date.parse(val)))) {
      return 'DATE';
    }

    const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    if (values.every((val) => typeof val === 'string' && timePattern.test(val))) {
      return 'TIMESTAMP';
    }

    return 'VARCHAR(1000)';
  };

  // Function to parse XLSX or XLS files using XLSX
  const handleParseXLSX = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      if (worksheet.length > 1) {
        const firstRow = worksheet[0]; // First row is the header
        const dataRows = worksheet.slice(1); // Remaining rows are data
        const detectedColumnTypes = {};

        // Check if headers match the existing tableColumns
        if (!compareHeaders(firstRow, tableColumns)) {
          message.error('Headers do not match the existing table structure.');
          setLoading(false);
          return;
        }

        // Check if the data matches existing table data
        if (compareData(dataRows, tableData)) {
          message.error('Uploaded data matches existing data.');
          setLoading(false);
          return;
        }

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
    };
    reader.readAsArrayBuffer(file);
  };

  // Function to parse CSV files using PapaParse
  const handleParseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 1) {
          const firstRow = result.data[0]; // First row is the header
          const dataRows = result.data.slice(1); // Remaining rows are data
          const detectedColumnTypes = {};

          // Check if headers match the existing tableColumns
          if (!compareHeaders(firstRow, tableColumns)) {
            message.error('Headers do not match the existing table structure.');
            setLoading(false);
            return;
          }

          // Check if the data matches existing table data
          if (compareData(dataRows, tableData)) {
            message.error('Uploaded data matches existing data.');
            setLoading(false);
            return;
          }

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

  // Check if headers match the existing table structure
  const compareHeaders = (uploadedHeaders, existingHeaders) => {
    const sortHeaders = (headers) => headers.map((header) => header.trim().toLowerCase()).sort(); // Sort and normalize headers

    const sortedUploadedHeaders = sortHeaders(uploadedHeaders);

    return existingHeaders.some((headerSet) => {
      const sortedExistingHeaders = sortHeaders(headerSet);
      return JSON.stringify(sortedExistingHeaders) === JSON.stringify(sortedUploadedHeaders);
    });
  };

  // Compare uploaded data against existing table data
  const compareData = (uploadedData, existingData) => {
    return existingData.some((existingRowSet) =>
      uploadedData.some((uploadedRow) => JSON.stringify(existingRowSet) === JSON.stringify(uploadedRow))
    );
  };

  // Handle changes in file selection
  const handleUploadChange = ({ file, fileList: newFileList }) => {
    const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
    if (tableNames.includes(fileNameWithoutExtension)) {
      message.error(`Table with name "${fileNameWithoutExtension}" already exists. File name cannot be the same.`);
      return; // Prevent file upload if name already exists
    }

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
      if (file.type === 'text/csv') {
        handleParseCSV(file.originFileObj);
      } else {
        handleParseXLSX(file.originFileObj);
      }
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

    const tableName = firstName + "_" + fileList[0].name.split('.').slice(0, -1).join('.');

    // Format parsed data to match DB column types
    const formattedData = parsedData.map((row) =>
      row.map((value, index) => {
        const columnType = selectedColumns[columns[index]]?.dbType;
        if (columnType === 'NUMERIC' || columnType === 'REAL') {
        
            // Convert value to float or null if it's not a valid number
            return isNaN(value) || value === '' ? null : parseFloat(value);

          // Ensure numeric types are parsed as numbers
        }
        return value;
      })
    );
    formattedData.pop()
    const payload = {
      tableName,
      columns: columnsToAdd,
      data: formattedData,
    };

    // Post the payload to your server (implement the logic accordingly)
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/createTableFromCSV`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        message.success('Table created successfully');
        setUploadedFiles([...uploadedFiles, fileList[0].name]); // Add file name to the list of uploaded files
        setFileList([]); // Clear the file list after successful upload
        setColumns([]); // Reset columns
        setSelectedColumns({}); // Reset selected columns
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

  const dataTypes = ['VARCHAR(1000)', 'CHAR[]', 'NUMERIC', 'NUMERIC[]', 'REAL', 'BOOLEAN', 'DATE', 'TIMESTAMP'];

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Upload
        name="file"
        listType="picture-circle"
        fileList={fileList}
        onChange={handleUploadChange}
        beforeUpload={beforeUpload} // Validate file types and prevent duplicates
        accept=".csv,.xls,.xlsx" // Only allow CSV, XLS, and XLSX files in the file picker
        showUploadList={true} // Show the list of uploaded files
        multiple={false} // Only allow one file at a time
        customRequest={({ onSuccess }) => {
          setTimeout(() => {
            setLoading(false);
            onSuccess('ok');
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
                  disabled
                  checked={selectedColumns[col]?.addToDatabase}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                />
                <span style={{ marginLeft: '10px', marginRight: '10px' }}>{col}</span>
                {selectedColumns[col]?.addToDatabase && (
                  <Select
                    placeholder="Select DB Type"
                    style={{ width: '200px' }}
                    disabled
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

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>Uploaded Files:</h3>
          <List
            bordered
            dataSource={uploadedFiles}
            renderItem={(file) => <List.Item>{file}</List.Item>}
          />
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
