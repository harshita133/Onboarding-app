
# Onboarding App

Welcome to the **Onboarding App**! This full-stack application allows users to onboard by submitting basic information, uploading CSV files, and managing data in a dynamic dashboard. The application is built using **React.js** for the frontend and **Node.js** for the backend, with **PostgreSQL** for data storage.

## Features

### 1. Onboarding Steps
- **Step 1: Basic Information Form**
  Users fill in basic details like name, email, phone, etc.

- **Step 2: CSV File Upload & Mapping**
  Users upload a CSV file (or spreadsheet) and map its columns to four pre-defined fields. The column mapping settings are saved to the database for future use.

- **Step 3: Additional CSV Upload**
  Users upload another CSV file with different headers. The data is similarly mapped and stored in the database, and the mappings are saved for reuse.

### 2. Dashboard
- Users can view all uploaded tables.
- Each table is clickable, and users can view its specific data on a detailed page.
- **Multi-file Upload**: Users can upload multiple files with the same column structure. The app automatically maps and creates new tables for the uploaded files, based on previously saved header mappings.

### 3. Data Management
- The app allows users to view, query, and manage their uploaded data via the dashboard.

### 4. Optional Features
- **Prefill Data Types**: Automatically guess and prefill the data types for columns during the onboarding process.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **UI Components**: Ant Design

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harshita133/Onboarding-app.git
   cd Onboarding-app
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up the PostgreSQL database and configure your database credentials in the `.env` file.

4. Run the server:
   ```bash
   npm run start
   ```

5. Navigate to `http://localhost:3000` in your browser to view the application.

### API Endpoints

- `POST /api/upload`: Handle CSV file uploads and mapping.
- `GET /api/getTableData?tableName={tableName}`: Fetch data for a specific table.
- `GET /api/dashboard`: Fetch the list of all uploaded tables.

## Usage

1. **Onboarding**: Start by filling out the basic info form, then proceed to upload your CSV files, mapping columns accordingly.
2. **Dashboard**: Once onboarded, access your dashboard to view, manage, and query uploaded data.
3. **Multi-file Upload**: Quickly upload multiple files that share the same column structure, with the application automating the table creation and data mapping process.

## Deployment

This application is deployed on Heroku platform. 



## Contributing
Feel free to contribute by opening issues or submitting pull requests to improve the application.


