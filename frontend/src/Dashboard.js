import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button,Alert } from 'antd'; // Import Modal and Button from Ant Design
import TableView from './TableView'; // Import TableView component
import MultiUpload from './MultiUpload'; // Import the new MultiUpload component

const Dashboard = () => {
  const { firstName } = useParams(); // Get firstName from the route parameters
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    uploadedTables: [],
  });

  const [selectedTable, setSelectedTable] = useState(''); // State for selected table
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility (TableView)
  const [isMultiUploadOpen, setIsMultiUploadOpen] = useState(false); // State for modal visibility (MultiUpload)
  const [tableColumns, setTableColumns] = useState([]); // Store table column names in 2D array
  const [tableData, setTableData] = useState([]); // Store table rows in 2D array
  const [error, setError] = useState(null);

  function getHeaders(tableNames){
    const fetchTableData = async () => {
      if (!tableNames || tableNames.length === 0) {
        setError('Missing or invalid tableNames parameter');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/getAllTableData?tableNames=${tableNames.join(',')}`);
        const data = await response.json();

        if (response.ok) {
          setTableColumns(data.columns); // Set the 2D array of columns
          setTableData(data.data); // Set the 2D array of table data
        } else {
          setError(data.error || 'Error fetching table data');
        }
      } catch (error) {
        setError('Error fetching table data');
      } 
    };

    if (tableNames && tableNames.length > 0) {
      fetchTableData();
    } else {
      setError('Missing or invalid tableNames parameter'); // Handle missing or empty tableNames
    }
  };

  useEffect(() => {
    // Fetch user details from the server using the firstName
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/getDetails?firstName=${firstName}`)
      .then((response) => response.json())
      .then((data) => {
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          uploadedTables: data.uploadedTables || [],
        });
        getHeaders(data.uploadedTables || [])
      })
      .catch((error) => console.error('Error fetching user details:', error));
  }, [firstName]);

  // Function to open the modal for TableView
  const openModal = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  // Function to close the TableView modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(''); // Clear the selected table when modal is closed
  };

  // Function to handle opening MultiUpload modal
  const openMultiUploadModal = () => {
    setIsMultiUploadOpen(true);
  };


  const closeMultiUploadModal = () => {
    setIsMultiUploadOpen(false);
    window.location.reload(); 
  };
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

  const styles = {
    navbar: {
      backgroundColor: '#fff',
      padding: '15px 20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: '"Roboto", sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#007BFF',
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
    },
    navLink: {
      textDecoration: 'none',
      color: '#333',
      fontSize: '1rem',
      padding: '8px 12px',
      borderRadius: '5px',
      transition: 'background-color 0.3s',
    },
    navLinkHover: {
      backgroundColor: '#f0f0f0',
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sidebar: {
      flex: '0.3',
      backgroundColor: '#f8f9fb',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
    userInfo: {
      marginBottom: '20px',
    },
    userInfoItem: {
      marginBottom: '10px',
    },
    userInfoLabel: {
      fontSize: '14px',
      color: '#888',
      marginBottom: '5px',
    },
    userInfoValue: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#007BFF',
      color: '#fff',
      padding: '10px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    mainContent: {
      flex: '0.65',
      padding: '20px',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      borderBottom: '2px solid #f0f0f0',
      paddingBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
    },
    statBox: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      width: '45%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    uploadedTablesSection: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    tableList: {
      listStyleType: 'none',
      paddingLeft: '0',
    },
    tableItem: {
      backgroundColor: '#fff',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      transition: 'background-color 0.2s',
      cursor: 'pointer',
    },
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Henon</div>
        <div style={styles.navLinks}>
          <a
            href="#"
            style={styles.navLink}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            Dashboard
          </a>
          <a
            href="#"
            style={styles.navLink}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            People
          </a>
          <a
            href="#"
            style={styles.navLink}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            Contracts
          </a>
          <a
            href="#"
            style={styles.navLink}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            More
          </a>
        </div>
      </nav>

      {/* Main Layout */}
      <div style={styles.container}>
        {/* Sidebar with User Details */}
        <div style={styles.sidebar}>
          <div style={styles.userInfo}>
            <div style={styles.userInfoItem}>
              <div style={styles.userInfoLabel}>First Name</div>
              <div style={styles.userInfoValue}>{user.firstName}</div>
            </div>
            <div style={styles.userInfoItem}>
              <div style={styles.userInfoLabel}>Last Name</div>
              <div style={styles.userInfoValue}>{user.lastName}</div>
            </div>
            <div style={styles.userInfoItem}>
              <div style={styles.userInfoLabel}>Email</div>
              <div style={styles.userInfoValue}>{user.email}</div>
            </div>
            <div style={styles.userInfoItem}>
              <div style={styles.userInfoLabel}>Phone</div>
              <div style={styles.userInfoValue}>{user.phone}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <h1 style={styles.sectionTitle}>Overview</h1>
          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{user.uploadedTables.length}</div>
              <p>Number of tables</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                [{tableColumns.map((cols) => cols.length).join(',')}]
              </div>
              <p>Number of columns</p>
            </div>
          </div>
          
          <div style={styles.uploadedTablesSection}>
            <div style={styles.sectionTitle}>
              <h2>Uploaded Tables</h2>
              <Button type="primary" onClick={openMultiUploadModal}>
                MultiUpload
              </Button>
            </div>
            <ul style={styles.tableList}>
              {user.uploadedTables.map((table, index) => (
                <li
                  key={index}
                  style={styles.tableItem}
                  onClick={() => openModal(table)} // Set selected table and open modal on click
                >
                  {table.split(`${firstName}_`)[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for TableView */}
      <Modal
        
        visible={isModalOpen}  // Controls modal visibility
        onOk={closeModal}  // Close modal on OK button
        onCancel={closeModal}  // Close modal on Cancel button
        centered  // Centers the modal vertically
        width={800}  // Set modal width
      >
        <TableView tableName={selectedTable} firstName={firstName}/> {/* Pass the selected table to TableView */}
      </Modal>

      {/* Modal for MultiUpload */}
      <Modal
        title="MultiUpload Files"
        visible={isMultiUploadOpen}  // Controls modal visibility for MultiUpload
        onOk={closeMultiUploadModal}  // Close modal on OK button
        onCancel={closeMultiUploadModal}  // Close modal on Cancel button
        centered  // Centers the modal vertically
        width={600}  // Set modal width for MultiUpload
      >
        <MultiUpload firstName={firstName} tableList={user.uploadedTables} tableColumns={tableColumns} tableData={tableData}/> {/* Render the MultiUpload component inside the modal */}
      </Modal>
    </>
  );
};

export default Dashboard;
