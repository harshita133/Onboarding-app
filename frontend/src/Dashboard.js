import React from 'react';

const Dashboard = () => {
  // Sample user data
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+123456789',
    uploadedTables: ['Table1.csv', 'Table2.csv', 'Table3.csv'],
  };

  // Inline styles
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
      fontFamily: '"Roboto", sans-serif',
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
          <button style={styles.button}>View All Fields</button>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <h1 style={styles.sectionTitle}>Overview</h1>
          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>12%</div>
              <p>Profile Completed</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>0h</div>
              <p>Time Reported This Month</p>
            </div>
          </div>

          <div style={styles.uploadedTablesSection}>
            <h2 style={styles.sectionTitle}>Uploaded Tables</h2>
            <ul style={styles.tableList}>
              {user.uploadedTables.map((table, index) => (
                <li key={index} style={styles.tableItem}>
                  {table}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
