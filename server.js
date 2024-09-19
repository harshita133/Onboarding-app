const express = require('express');
const cors = require('cors');
const path=require('path')
const pool=require('./database')

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 
// console.log(__dirname)
app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/hello', (req, res) => {
  
  const columnDefinitions = `
    firstName TEXT, 
    lastName TEXT, 
    phone NUMERIC, 
    email TEXT
  `;

  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS UserDetails (${columnDefinitions})`;

  
  pool.query(createTableQuery)
    .then((response) => {
      console.log("Table created or already exists");

    
      const selectTableQuery = `SELECT * FROM UserDetails`;
      return pool.query(selectTableQuery); 
    })
    .then((response) => {
      console.log("Fetching Data");
      console.log(response.rows); 
      res.json({ message: 'Table created and data fetched successfully!', data: response.rows });
    })
    .catch((err) => {
      console.error("Error creating table or fetching data:", err);
      res.status(500).json({ error: 'Error creating table or fetching data' });
    });
});

app.get('/api/check', (req, res) => {

  const selectTableQuery=`SELECT "firstName", "lastName", phone, email FROM "UserDetails";`
  pool.query(selectTableQuery).then((response)=>{
    console.log("Fetching Data")
    console.log(response.rows)
  })
  .catch((err)=>{
    console.log(err)
  })
  res.json({ message: 'Hello World from the backend!' });
});

app.post('/api/insertNewUser', (req, res) => {
  
  const { firstName, lastName, email, phonenumber } = req.body;
  const insertQuery = `
    INSERT INTO public."UserDetails"(
      "firstName", "lastName", email, phone)
    VALUES ($1, $2, $3, $4);
  `;

  pool.query(insertQuery, [firstName, lastName, email, phonenumber])
    .then((response) => {
      res.status(201).json({ message: 'User added successfully', data: response.rows });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Error inserting user' });
    });
});


app.post('/api/findUser', (req, res) => {
  const { firstName } = req.body;

 
  const query = `SELECT "firstName", "lastName", phone, email FROM public."UserDetails" WHERE "firstName" = $1;`;
  pool.query(query, [firstName], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'User found', user: result.rows[0] });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  });
});


app.post('/api/createTableFromCSV', (req, res) => {
  const { tableName, columns, data } = req.body;

  
  const columnDefinitions = columns
    .map((col) => `"${col.name}" ${col.dbType.toUpperCase()}`)
    .join(', ');

  const createTableQuery = `CREATE TABLE "${tableName}" (${columnDefinitions})`;
  pool.query(createTableQuery, (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: 'Error creating table', error: err });
    }

   
    const insertValues = data.map((row) => `(${row.map((val) => `'${val}'`).join(', ')})`).join(', ');
    const insertQuery = `INSERT INTO "${tableName}" (${columns.map((col) => `"${col.name}"`).join(', ')}) VALUES ${insertValues}`;
    console.log(insertQuery)
    pool.query(insertQuery, (err) => {
      console.log(err)
      if (err) {
        return res.status(500).json({ message: 'Error inserting data', error: err });
      }
      res.status(200).json({ message: 'Table created and data inserted successfully' });
    });
  });
});



app.get('/api/getDetails', async (req, res) => {
  const { firstName } = req.query; 

  if (!firstName) {
    return res.status(400).json({ error: 'Missing firstName parameter' });
  }

  try {
    
    const userDetailsQuery = `
      SELECT "firstName", "lastName", email, phone 
      FROM public."UserDetails" 
      WHERE "firstName" = $1
    `;
    const userDetailsResult = await pool.query(userDetailsQuery, [firstName]);

    
    if (userDetailsResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE $1
    `;
    const tablesResult = await pool.query(tablesQuery, [`${firstName}_%`]);

    const userDetails = userDetailsResult.rows[0];
    const uploadedTables = tablesResult.rows.map(row => row.table_name); 

    
    res.json({
      ...userDetails,
      uploadedTables, 
    });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.get('/api/getTableData', async (req, res) => {
  const { tableName } = req.query; 

  if (!tableName) {
    return res.status(400).json({ error: 'Missing tableName parameter' });
  }

  
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    
    const result = await pool.query(`SELECT * FROM public."${tableName}"`);

   
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found or no data available' });
    }

    
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ error: 'Database error or table not found' });
  }
});


app.get('/api/getAllTableData', async (req, res) => {
  const { tableNames } = req.query;
  console.log(tableNames.length)
  
  const tableNamesArray = tableNames ? tableNames.split(',') : [];

  if (!tableNamesArray || tableNamesArray.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid tableNames parameter' });
  }

  try {
    const columnNames = [];
    const tableData = [];
    
    for (const tableName of tableNamesArray) {
     
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: `Invalid table name: ${tableName}` });
      }

      
      const columnResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
      `);
      const tableResult = await pool.query(`SELECT * FROM public."${tableName}"`);

      
      columnNames.push(columnResult.rows.map(row => row.column_name));
      tableData.push(tableResult.rows); 
    }

    res.json({ columns: columnNames, data: tableData });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ error: 'Database error or table not found' });
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend is running on post ${port}`);
});