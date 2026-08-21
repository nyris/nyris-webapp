const ScopeMissing = () => {
  const { supportEmail } = window.settings.auth0;

  return (
    <div className="pl-8 desktop:pl-16 pt-6 desktop:pt-8 flex flex-col gap-4 bg-white h-full">
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#2B2C46',
        }}
      >
        Access Denied
      </div>

      <div
        style={{
          width: '200px',
          height: '4px',
          borderRadius: '4px',
        }}
        className="bg-red-500"
      />

      <p style={{ color: '#2B2C46', fontSize: '13px' }}>
        You do not have access to the {window.settings.visualSearchFilterKey}.
        If you believe this is an error, please contact support.
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
        }?subject=Access Denied&body=`}
      >
        Contact Support
      </a>
    </div>
  );
};

export default ScopeMissing;
