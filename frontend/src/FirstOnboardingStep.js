import React from 'react';
import { Form, Input, Row, Col } from 'antd';

const FirstOnboardingStep = ({ form }) => {
  // Custom validation for first and last names (no numbers allowed)
  const nameValidation = {
    pattern: /^[A-Za-z]+$/,
    message: 'Name must contain only letters!',
  };

  // Custom validation for phone number (only numbers and length constraint)
  const phoneValidation = {
    pattern: /^[0-9]{10,12}$/, // Allows only numbers with a length between 10 and 12 digits
    message: 'Phone number must contain only numbers and be between 10 and 12 digits!',
  };

  return (
    <Row justify="start"> {/* Ensures the form is aligned to the left */}
      <Col xs={24} sm={18} md={12} lg={8}> {/* Adjusts form width for different screen sizes */}
        <Form
          form={form}
          name="firstStep"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          autoComplete="off"
          layout="vertical" // Vertically aligned form layout
        >
          <Form.Item
            label="First Name"
            name="firstname"
            rules={[
              { required: true, message: 'Please input your first name!' },
              nameValidation,
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[
              { required: true, message: 'Please input your last name!' },
              nameValidation,
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phonenumber"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              phoneValidation,
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default FirstOnboardingStep;
