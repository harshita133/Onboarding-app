const express = require('express');
const cors = require('cors');
const path=require('path')
const pool=require('./database')

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); 
console.log(__dirname)
app.use(express.static(path.join(__dirname, 'public')));
// API route

app.get('/api/getDetails', (req, res) => {
  console.log("check check check")
  // Define the column structure
  const columnDefinitions = `
    firstName TEXT, 
    lastName TEXT, 
    phone NUMERIC, 
    email TEXT
  `;

  // Create the SQL query to create the UserDetails table
  const createTableQuery = `CREATE TABLE IF NOT EXISTS "UserDetails" (${columnDefinitions})`;

  // Execute the query using the PostgreSQL pool
  pool.query(createTableQuery)
    .then((response) => {
      console.log("Table created or already exists");

      // Optionally fetch data to verify table creation
      const selectTableQuery = `SELECT * FROM UserDetails`;
      return pool.query(selectTableQuery); // Fetch data from the table
    })
    .then((response) => {
      console.log("Fetching Data");
      console.log(response.rows); // Log the data in the table
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

// Handle the POST request to find the user
app.post('/api/findUser', (req, res) => {
  const { firstName } = req.body;

  // Query the database to find the user by first name
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

  // Construct CREATE TABLE query
  const columnDefinitions = columns
    .map((col) => `${col.name} ${col.dbType.toUpperCase()}`)
    .join(', ');

  const createTableQuery = `CREATE TABLE ${tableName} (${columnDefinitions})`;
  pool.query(createTableQuery, (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: 'Error creating table', error: err });
    }

    // Insert CSV data into the newly created table
    const insertValues = data.map((row) => `(${row.map((val) => `'${val}'`).join(', ')})`).join(', ');
    const insertQuery = `INSERT INTO ${tableName} (${columns.map((col) => col.name).join(', ')}) VALUES ${insertValues}`;
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


// Define the /api/getDetails route to fetch user details and tables
// app.get('/api/getDetails', async (req, res) => {
//   const { firstName } = req.query; // Extract firstName from query params

//   if (!firstName) {
//     return res.status(400).json({ error: 'Missing firstName parameter' });
//   }

//   try {
//     // Query to fetch user details based on firstName
//     const userDetailsQuery = `
//       SELECT "firstName", "lastName", email, phone 
//       FROM public."UserDetails" 
//       WHERE "firstName" = $1
//     `;
//     const userDetailsResult = await pool.query(userDetailsQuery, [firstName]);

//     // Check if the user was found
//     if (userDetailsResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Query to fetch tables matching the pattern firstName_<table_name>
//     const tablesQuery = `
//       SELECT table_name 
//       FROM information_schema.tables 
//       WHERE table_schema = 'public' AND table_name LIKE $1
//     `;
//     const tablesResult = await pool.query(tablesQuery, [`${firstName}_%`]);

//     const userDetails = userDetailsResult.rows[0];
//     const uploadedTables = tablesResult.rows.map(row => row.table_name); // Extract table names

//     // Send the user details and table names as a response
//     res.json({
//       ...userDetails,
//       uploadedTables, // Add the list of tables
//     });
//   } catch (err) {
//     console.error('Error querying the database:', err);
//     res.status(500).json({ error: 'Database error' });
//   }
// });


app.get('/api/getTableData', async (req, res) => {
  const { tableName } = req.query; // Extract tableName from query params

  if (!tableName) {
    return res.status(400).json({ error: 'Missing tableName parameter' });
  }

  // Validate the table name (simple check for allowed characters to prevent SQL injection)
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    // Query to fetch all data from the given table
    const result = await pool.query(`SELECT * FROM public."${tableName}"`);

    // Check if the table has any data
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found or no data available' });
    }

    // Send the table data as a response
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ error: 'Database error or table not found' });
  }
});


app.get('/api/getAllTableData', async (req, res) => {
  const { tableNames } = req.query; // Extract tableNames from query params (array expected)
  console.log(tableNames.length )
  if (!tableNames || !Array.isArray(tableNames) || tableNames.length === 0) {
    console.log("failure")
    return res.status(400).json({ error: 'Missing or invalid tableNames parameter' });
  }

  try {
    const columnNames = [];
    const tableData = [];
    console.log(tableNames)
    for (const tableName of tableNames) {
      console.log("hello")
      // Validate the table name (simple check for allowed characters to prevent SQL injection)
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        console.log("dasdaknsdkansdkansjk")
        return res.status(400).json({ error: `Invalid table name: ${tableName}` });
      }
      console.log("dadasdada")
      // Query to get column names for each table
      const columnResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
      `);
      const tableResult = await pool.query(`SELECT * FROM public."${tableName}"`);

      // Collect columns and table data
      columnNames.push(columnResult.rows.map(row => row.column_name));
      tableData.push(tableResult.rows); // Push rows data from the current table
      console.log(columnNames)
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
// Start server
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});