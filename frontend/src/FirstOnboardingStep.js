import React, { useState } from 'react';
import { Button, Form, Input, Radio, Row, Col } from 'antd';

const onFinish = (values) => {
  fetch('http://localhost:5000/api/insertNewUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: values.firstname.toLowerCase(),
      lastName: values.lastname.toLowerCase(),
      email: values.email.toLowerCase(),
      phonenumber: values.phonenumber,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('User added successfully:', data.message);
    })
    .catch((error) => console.error('Error adding user:', error));
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const FirstOnboardingStep = () => {
  const [hasTables, setHasTables] = useState(false); // State to track if user has tables

  // Function to handle the change in the radio button
  const handleHasTablesChange = (e) => {
    setHasTables(e.target.value === 'yes'); // If 'yes', show the input field
  };

  return (
    <>
      <Row gutter={16}>
        {/* Left Column: Form */}
        <Col span={12}>
          <Form
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                {
                  required: true,
                  message: 'Please input your firstname!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                {
                  required: true,
                  message: 'Please input your lastname!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phonenumber"
              rules={[
                {
                  required: true,
                  message: 'Please input your phone number!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
              style={{ marginBottom: '5px' }}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>


      </Row>
    </>
  );
};

export default FirstOnboardingStep;
