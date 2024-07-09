import React from 'react';
import { Loader } from '@mantine/core';

const LoaderComponent = () => {
  return (
    <Loader
      size={50}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default LoaderComponent;
