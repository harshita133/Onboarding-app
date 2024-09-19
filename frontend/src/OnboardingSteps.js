import React, { useState } from 'react';
import { Button, Steps, message, Form } from 'antd';
import FirstOnboardingStep from './FirstOnboardingStep';
import SecondOnboardingStep from './SecondOnboardingStep';
import ThirdOnboardingStep from './ThirdOnboardingStep';

const OnBoardingSteps = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [firstName, setFirstName] = useState("");
  const [columns, setColumns] = useState([]);
  const [parsedData, setParsedData] = useState([]);

  const next = () => {
    if (current === 0) {
      form.validateFields()
        .then((values) => {
          setFirstName(values.firstname.toLowerCase());
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/insertNewUser`, {
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
              message.success('User added successfully');
              setCurrent(current + 1);
            })
            .catch((error) => {
              message.error('Error adding user');
            });
        })
        .catch((info) => {
          console.log('Validate Failed:', info);
        });
    } else {
      setCurrent(current + 1);
    }
  };

  const saveFile = (columns, dataRows) => {
    setColumns(columns);
    setParsedData(dataRows);
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const contentStyle = {
    marginTop: 16,
  };

  const steps = [
    {
      title: 'Fill personal details',
      content: <FirstOnboardingStep form={form} onNext={next} />,
    },
    {
      title: 'Upload CSV',
      content: <SecondOnboardingStep onNext={next} saveFile={saveFile} firstName={firstName} />,
    },
    {
      title: 'Upload CSV with different headers',
      content: <ThirdOnboardingStep firstName={firstName} previousColumns={columns} previousRows={parsedData} />,
    },
  ];

  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome to the Onboarding Process</h1>
      <Steps current={current}>
        {steps.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div style={contentStyle}>
        {current === 0 ? <FirstOnboardingStep form={form} /> : steps[current].content}
      </div>

      <div style={{ marginTop: 24 }}>
        {current != 1 && current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current == 2 && current < steps.length && (
          <Button type="primary" onClick={prev}>
            Prev
          </Button>
        )}
      </div>
    </>
  );
};

export default OnBoardingSteps;
