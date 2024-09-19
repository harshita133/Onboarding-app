import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Checkbox, Select, Button, Row, Col } from 'antd';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; 

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
    return 'NUMERIC'; // Use NUMERIC for integer columns
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


const SecondOnboardingStep = ({ onNext, saveFile, firstName }) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [parsedData, setParsedData] = useState([]);

  
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

     
      const filteredDataRows = dataRows.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

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
    }
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

  const handleNext = () => {
    if (!fileUrl) {
      onNext();
      return;
    }

   
    const parsedNumericData = parsedData.map((row) =>
      row.map((value, index) => {
        const column = columns[index];
        const dbType = selectedColumns[column]?.dbType;

       
        if (dbType === 'NUMERIC' || dbType === 'REAL') {
          return isNaN(value) || value === '' ? null : parseFloat(value);
        }
        return value;
      })
    );

    const columnsToAdd = Object.keys(selectedColumns)
      .filter((col) => selectedColumns[col].addToDatabase)
      .map((col) => ({
        name: col,
        dbType: selectedColumns[col].dbType,
      }));

    const payload = {
      tableName: firstName + "_" + fileUrl.name.split('.').slice(0, -1).join('.'), 
      columns: columnsToAdd,
      data: parsedNumericData, 
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
        saveFile(columns, parsedNumericData); 
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
