import { useAppSelector } from 'Store/Store';
import React from 'react';

import { useMediaQuery } from 'react-responsive';

function NoAccess() {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { supportEmail } = useAppSelector(state => state.settings.auth0);

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100%',
        paddingLeft: isMobile ? '32px' : '64px',
        paddingTop: isMobile ? '24px' : '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#2B2C46',
        }}
      >
        Email verification is required
      </div>

      <div
        style={{
          width: '200px',
          height: '4px',
          background: '#3E36DC',
          borderRadius: '4px',
        }}
      />

      <p style={{ color: '#2B2C46', fontSize: '13px' }}>
        Please verify your email for access to the Search Suite. If you haven't
        received your verification email yet, contact support.
      </p>
      <a
        className="contact-support"
        style={{
          backgroundColor: '#2B2C46',
          padding: '8px 16px 8px 16px',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          width: 'fit-content',
        }}
        href={`mailto:${
          supportEmail || 'support@nyris.io'
        }?subject=Resend Email Verification&body=`}
      >
        Contact Support
      </a>
    </div>
  );
}

export default NoAccess;
