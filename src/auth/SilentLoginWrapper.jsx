
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

const SilentLoginWrapper = ({ children }) => {
  const auth = useAuth();

  // useEffect(() => {
  //   if (!auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
  //     auth.signinSilent().catch((err) => {
  //       console.error('Silent login failed: ', err);
  //     });
  //   }
  // }, [auth]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      auth.signinSilent().catch((err) => {
        console.warn("Silent login 실패:", err);
      });
    }
  }, []);

  return children;
};

export default SilentLoginWrapper;