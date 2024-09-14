import React, { useState } from 'react';
import { Button, Form, Input, Radio, Row, Col } from 'antd';

const onFinish = (values) => {
  console.log('Success:', values);
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

        {/* Right Column: Question */}
        <Col span={12}>
          <div style={{ marginTop: '0px' }}>
            <h3 style={{ marginBottom: '0px' }}>Do you already have tables stored with us?</h3>
            <Radio.Group onChange={handleHasTablesChange} style={{ marginBottom: '0px' }}>
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </Radio.Group>

            {/* Input field for table name, shown only if "Yes" is selected */}
            {hasTables && (
              <Form.Item
                label="Table Name"
                name="tablename"
                style={{ marginTop: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'Please input the table name!',
                  },
                ]}
              >
                <Input placeholder="Enter your table name" />
              </Form.Item>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default FirstOnboardingStep;
