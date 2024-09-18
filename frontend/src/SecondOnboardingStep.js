import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Checkbox, Select, Button, Row, Col } from 'antd';
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
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (!isSpreadsheet) {
    message.error('You can only upload CSV or Excel files!');
  }
  return isSpreadsheet;
};

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

const SecondOnboardingStep = ({ onNext,saveFile, firstName }) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);

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

  const handleChange = (info) => {
    const file = info.file.originFileObj;
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    setFileUrl(file);
    handleParseCSV(file);
  };

  const handleCheckboxChange = (columnName, checked) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        addToDatabase: checked,
      },
    });
  };

  const handleDbTypeChange = (columnName, value) => {
    setSelectedColumns({
      ...selectedColumns,
      [columnName]: {
        ...selectedColumns[columnName],
        dbType: value,
      },
    });
  };

  // Handle the 'Next' button click to send data to parent
  const handleNext = () => {
    if (!fileUrl) {
      // If no file is uploaded, just proceed to the next step without data
      onNext();
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
      tableName: firstName + "_" + fileUrl.name.split('.').slice(0, -1).join('.'), // Use the file name as the table name
      columns: columnsToAdd,
      data: parsedData,
    };

    // Send POST request with the CSV data to the server
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
        saveFile(columns,parsedData); // Go to the next step
      })
      .catch((error) => {
        message.error('Error creating table');
      });
  };

  const uploadButton = (
    <div style={{ border: 0, background: 'none', cursor: 'pointer', display: 'inline-block', width: '100px', height: '100px', borderRadius: '50%', border: '1px dashed #d9d9d9', textAlign: 'center', verticalAlign: 'middle', paddingTop: '30px', fontSize: '16px', color: '#999' }}>
      {loading ? <LoadingOutlined style={{ fontSize: 24 }} /> : <PlusOutlined style={{ fontSize: 24 }} />}
      <div style={{ marginTop: 8 }}>Upload CSV/Excel</div>
    </div>
  );

  const dataTypes = ['varchar(1000)', 'char[]', 'numeric', 'numeric[]', 'float', 'boolean', 'date', 'time'];

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
              onSuccess("ok");
            }, 0);
          }}
        >
          {uploadButton}
        </Upload>
      </Col>

      <Col xs={24} md={12} lg={8} style={{ textAlign: 'center' }}>
        {columns.length > 0 && (
          <>
            <h3>Select Columns to Add to Database and Specify Type:</h3>
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'center', width: '100%' }}>
                {columns.map((col, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '5px' }}>
                    <Checkbox checked={selectedColumns[col]?.addToDatabase} onChange={(e) => handleCheckboxChange(col, e.target.checked)} />
                    <span style={{ width: '150px', textAlign: 'left', paddingLeft: '10px' }}>{col}</span>
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
          </>
        )}
      </Col>

      <Col xs={24} style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </Col>
    </Row>
  );
};

export default SecondOnboardingStep;
