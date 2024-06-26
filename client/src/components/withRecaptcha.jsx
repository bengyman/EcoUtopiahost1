import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const withRecaptcha = (Component) => (props) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <Component {...props} />
    </GoogleReCaptchaProvider>
  );
};

export default withRecaptcha;
