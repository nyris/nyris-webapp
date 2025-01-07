import { useAuth0 } from '@auth0/auth0-react';
import EmailVerification from 'components/EmailVerification';
import { useEffect, ReactElement } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { auth0 } = window.settings;

  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated && auth0.enabled) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated, auth0]);

  if (!auth0.enabled) {
    return children;
  }

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (!isLoading && isAuthenticated && user?.email_verified) {
    return children;
  }

  if (!isLoading && isAuthenticated && !user?.email_verified) {
    return <EmailVerification />;
  }

  return <div></div>;
}
