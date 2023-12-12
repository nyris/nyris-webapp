import { Box, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { ReactComponent as IconCameraMobile } from 'common/assets/icons/icon_camera_mobile.svg';
import CameraCustom from './drawer/cameraCustom';
import { ReactComponent as Home } from 'common/assets/icons/home.svg';
import { NavLink, useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { ReactComponent as IconLogout } from 'common/assets/icons/logout.svg';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';

import {
  reset,
  setImageCaptureHelpModal,
  setPreFilter,
} from 'Store/search/Search';
import { useAuth0 } from '@auth0/auth0-react';
import DefaultModal from './modal/DefaultModal';

interface Props {
  onLoadingMobile?: any;
}

function FooterMobile(props: Props): JSX.Element {
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const history = useHistory();
  const {
    search: { imageCaptureHelpModal },
  } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const { settings } = useAppSelector(state => state);
  const { user, isAuthenticated, logout } = useAuth0();
  const auth0 = settings.auth0;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <DefaultModal
        openModal={showLogoutModal}
        handleClose={() => {
          setShowLogoutModal(false);
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '360px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setShowLogoutModal(false)}
          >
            <CloseIcon
              width={'16px'}
              height={'16px'}
              fontSize={'16px'}
              color="black"
            />
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2B2C46' }}>
            Logout
          </p>
          <p style={{ fontSize: '13px', color: '#2B2C46', paddingTop: '16px' }}>
            Are you sure you want to log out? Your session will be securely
            closed.
          </p>
          <p style={{ fontSize: '13px', color: '#2B2C46', paddingTop: '16px' }}>
            Email
          </p>
          <div
            style={{
              backgroundColor: '#FAFAFA',
              height: '32px',
              paddingLeft: '16px',
              paddingRight: '16px',
              marginTop: '8px',
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
        </div>
      </DefaultModal>
      <Box
        className="box-footer-mobile"
        display={'flex'}
        position={'relative'}
        alignItems={'center'}
        height={'100%'}
        justifyContent={'space-between'}
        style={{ paddingLeft: '16px', paddingRight: '16px', height: '64px' }}
      >
        <NavLink
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '100%',
            backgroundColor:
              history.location.pathname === '/' && !imageCaptureHelpModal
                ? `#E0E0E0`
                : '',
          }}
          activeClassName="active"
          to={'/'}
          className="nav-link p-0 menu-children rounded-0"
          onClick={() => {
            dispatch(reset(''));
            dispatch(setPreFilter({}));
            dispatch(setImageCaptureHelpModal(false));
          }}
        >
          <Home
            color={
              history.location.pathname === '/' && !imageCaptureHelpModal
                ? '#2B2C46'
                : '#AAABB5'
            }
          />
        </NavLink>
        {history.location?.pathname !== '/' && !imageCaptureHelpModal && (
          <Box className="box-icon-camera-mobile">
            <Button
              onClick={() => {
                setOpenModalCamera(!isOpenModalCamera);
              }}
            >
              <IconCameraMobile color="#55566B" />
            </Button>
          </Box>
        )}
        <div style={{ display: 'flex', gap: '24px' }}>
          {history.location?.pathname !== '/' && (
            <div
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '100%',
                backgroundColor: imageCaptureHelpModal ? `#E0E0E0` : '',
              }}
              onClick={() => {
                dispatch(setImageCaptureHelpModal(!imageCaptureHelpModal));
              }}
            >
              <IconInfo
                fontSize={24}
                width={24}
                height={24}
                color={imageCaptureHelpModal ? '#2B2C46' : '#AAABB5'}
              />
            </div>
          )}
          {auth0.enabled && isAuthenticated && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => {
                setShowLogoutModal(true);
              }}
            >
              <IconLogout fontSize={24} width={24} height={24} />
            </div>
          )}
        </div>
      </Box>
      <Box className="box-screenshot-camera">
        <CameraCustom
          isToggle={isOpenModalCamera}
          onToggleModal={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </Box>
    </>
  );
}

export default FooterMobile;
