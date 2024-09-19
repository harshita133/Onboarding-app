import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Checkbox, Select, Row, Col, Button } from 'antd';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; 
import { useNavigate } from 'react-router-dom';

const { Option } = Select;


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

const detectColumnType = (values) => {
 
  if (values.every((val) => typeof val === 'string' && ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()))) {
    return 'BOOLEAN';
  }
 
  if (values.every((val) => !isNaN(val) && Number.isInteger(parseFloat(val)))) {
    return 'NUMERIC';
  }
  
  if (values.every((val) => !isNaN(val))) {
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

const ThirdOnboardingStep = ({ firstName, previousColumns, previousRows }) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const navigate = useNavigate();

  
  const handleParseFile = (file) => {
    if (file.type === 'text/csv') {
    
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
     
      handleParseXLSX(file, processParsedData);
    } else {
      message.error('Unsupported file format');
    }
  };

  
  const processParsedData = (data) => {
    if (data && data.length > 1) {
      const firstRow = data[0]; 
      const dataRows = data.slice(1); 

      
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
      setParsedData(filteredDataRows); 
      setLoading(false); 
      validate(firstRow, filteredDataRows);
    }
  };

  const validate = (selectedColumns, selectedParseData) => {
    const isSameHeaders = JSON.stringify(selectedColumns) === JSON.stringify(previousColumns);
    const isSameData = JSON.stringify(selectedParseData) === JSON.stringify(previousRows);
    if (isSameHeaders || isSameData) {
      setErrorMessage('The uploaded file has the same headers and data as the previous file.');
      setIsDisabled(true); 
      return false;
    }
    setErrorMessage(''); 
    setIsDisabled(false); 
    return true;
  };

  
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
      tableName: firstName + '_' + fileUrl.name.split('.').slice(0, -1).join('.') + '_2', 
      columns: columnsToAdd,
      data: parsedData,
    };

   
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
    handleParseFile(file); 
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

