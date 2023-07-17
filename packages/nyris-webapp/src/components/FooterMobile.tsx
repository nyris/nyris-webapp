import { Box, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { ReactComponent as IconCameraMobile } from 'common/assets/icons/icon_camera_mobile.svg';
import CameraCustom from './drawer/cameraCustom';
import { ReactComponent as Home } from 'common/assets/icons/home.svg';
import { NavLink, useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { setImageCaptureHelpModal } from 'Store/search/Search';

interface Props {
  onLoadingMobile?: any;
}

function FooterMobile(props: Props): JSX.Element {
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const history = useHistory();
  const {
    settings,
    search: { imageCaptureHelpModal },
  } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  return (
    <>
      <Box
        className="box-footer-mobile"
        display={'flex'}
        position={'relative'}
        alignItems={'center'}
        height={'100%'}
        justifyContent={'space-between'}
        style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                ? `${settings.theme?.primaryColor}21`
                : '',
          }}
          activeClassName="active"
          to={'/'}
          className="nav-link p-0 menu-children rounded-0"
          onClick={() => {
            dispatch(setImageCaptureHelpModal(false));
          }}
        >
          <Home
            color={
              history.location.pathname === '/' && !imageCaptureHelpModal
                ? settings.theme?.primaryColor
                : '#000'
            }
          />
        </NavLink>
        {history.location?.pathname !== '/' && (
          <Box className="box-icon-camera-mobile">
            <Button
              onClick={() => {
                setOpenModalCamera(!isOpenModalCamera);
              }}
            >
              <IconCameraMobile color="#000" />
            </Button>
          </Box>
        )}
        {history.location?.pathname !== '/' && (
          <div
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '100%',
              backgroundColor: imageCaptureHelpModal
                ? `${settings.theme?.primaryColor}21`
                : '',
            }}
            onClick={() => {
              dispatch(setImageCaptureHelpModal(!imageCaptureHelpModal));
            }}
          >
            <IconInfo
              fontSize={24}
              width={24}
              height={24}
              color={
                imageCaptureHelpModal ? settings.theme?.primaryColor : '#000'
              }
            />
          </div>
        )}
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
