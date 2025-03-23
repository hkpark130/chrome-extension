import React from 'react';
import { AuthProvider } from 'react-oidc-context';
import { userManager } from '@/auth/oidcConfig';
import SilentLoginWrapper from '@/auth/SilentLoginWrapper';

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const AuthProviderWrapper = ({ children }) => {
  return (
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
      <SilentLoginWrapper>{children}</SilentLoginWrapper>
    </AuthProvider>
  );
};

export default AuthProviderWrapper;
