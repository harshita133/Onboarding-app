import React, { useState } from 'react';
import { Button, Form, Input, Radio, Typography, Layout, message } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook for navigation
import OnBoardingSteps from './OnboardingSteps'; // Import the OnBoardingSteps component

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  const [hasTables, setHasTables] = useState(false);
  const [onBoardingStep, setOnBoardingStep] = useState(false); // Track if onboarding should be shown
  const [form] = Form.useForm();
  const navigate = useNavigate(); // Use the useNavigate hook for redirecting

  const handleHasTablesChange = (e) => {
    setHasTables(e.target.value === 'yes');
    if (e.target.value === 'no') setOnBoardingStep(true);
    else setOnBoardingStep(false);
  };

  const handleOnboarding = () => {
    // Set onboarding step to true when the button is clicked
    setOnBoardingStep(true);
  };

  const handleDashboardSubmit = (values) => {
    fetch('http://localhost:5000/api/findUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: values.firstname,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          message.success('User found, redirecting to dashboard...');
          navigate('/dashboard'); // Redirect to the /dashboard page if the user is found
        } else {
          message.error('Incorrect Username or You are not a member with us');
        }
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        message.error('An error occurred while fetching the user.');
      });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f7f7 0%, #ffffff 100%)' }}> {/* Light Gray to White Gradient */}
      <Header style={{ backgroundColor: '#001529', padding: '0 50px' }}>
        <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>DataFlow</div>
      </Header>

      <Content style={{ padding: '50px 50px', textAlign: 'center', flexGrow: 1 }}> {/* FlexGrow to push footer down */}
        {!onBoardingStep ? (
          <>
            <Title style={{ color: '#004d40' }}>Effortlessly manage and analyze your data</Title>
            <Paragraph style={{ color: '#004d40' }}>Start organizing your data today by onboarding with us.</Paragraph>

            {/* Onboard with Us Button */}
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: '20px' }} 
              onClick={handleOnboarding}
            >
              Onboard with Us
            </Button>

            <div style={{ marginTop: '40px' }}>
              <Title level={3} style={{ color: '#004d40' }}>Do you already have tables stored with us?</Title>
              <Radio.Group onChange={handleHasTablesChange} style={{ marginBottom: '20px' }}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>

              {hasTables && (
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }} onFinish={handleDashboardSubmit}>
                  <Form.Item
                    label="First Name"
                    name="firstname"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the first name!',
                      },
                    ]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Go to Dashboard
                    </Button>
                  </Form.Item>

                </Form>
              )}
            </div>
          </>
        ) : (
          // Render OnBoardingSteps component if onboarding step is true
          <OnBoardingSteps />
        )}
      </Content>

      {/* Sticky Footer */}
      <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5' }}>
        DataFlow ©2024 Created for Henon.io
      </Footer>
    </Layout>
  );
};

export default Home;
