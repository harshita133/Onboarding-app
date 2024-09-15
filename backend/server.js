const express = require('express');
const cors = require('cors');
const pool=require('./database')

const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); 
// API route
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
  console.log("in query",req.body)

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

// Start server
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
