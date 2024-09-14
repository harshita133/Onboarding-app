import React, { useState } from 'react';
import { Button, message, Steps, theme } from 'antd';
import FirstOnboardingStep from './FirstOnboardingStep';
import SecondOnboardingStep from './SecondOnboardingStep';
import ThirdOnboardingStep from './ThirdOnboardingStep';


const steps = [
  {
    title: 'Fill personal details',
    content: <FirstOnboardingStep />,
  },
  {
    title: 'Upload CSV',
    content: <SecondOnboardingStep />,
  },
  {
    title: 'Upload second CSV',
    content: <ThirdOnboardingStep />,
  },
];
const OnBoardingSteps = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  return (
    <>

    <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome to the Onboarding Process</h1>

      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div
        style={{
          marginTop: 24,
        }}
      >
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()} style={{ marginRight:'0'}}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}

      </div>
    </>
  );
};
export default OnBoardingSteps;