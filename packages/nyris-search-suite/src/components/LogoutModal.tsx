import { useAuth0 } from '@auth0/auth0-react';
import { Icon } from '@nyris/nyris-react-components';
import { Dialog, DialogContent } from './modal/dialog';

function LogoutModal({
  setShowLogoutModal,
  showModal,
}: {
  showModal: boolean;
  setShowLogoutModal: (showModal: boolean) => void;
}) {
  const { user, logout } = useAuth0();

  return (
    <Dialog open={showModal} onOpenChange={() => setShowLogoutModal(false)}>
      <DialogContent className="bh-white w-[360px] p-6 bg-white">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2B2C46' }}>
          Logout
        </p>
        <p style={{ fontSize: '13px', color: '#2B2C46', paddingTop: '16px' }}>
          Are you sure you want to log out? Your session will be securely
          closed.
        </p>
        <p style={{ fontSize: '13px', color: '#2B2C46' }}>Email</p>
        <div
          style={{
            backgroundColor: '#FAFAFA',
            height: '32px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          {user?.email}
        </div>
        <div style={{ display: 'flex', width: '100%', marginTop: '16px' }}>
          <div
            style={{
              width: '50%',
              backgroundColor: '#2B2C46',
              color: 'white',
              padding: '16px',
              cursor: 'pointer',
            }}
            onClick={() => {
              logout({
                logoutParams: { returnTo: window.location.origin },
              });
            }}
          >
            Confirm log out
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LogoutModal;
