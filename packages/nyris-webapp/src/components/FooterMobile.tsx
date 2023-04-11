import { Box, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { ReactComponent as IconCameraMobile } from 'common/assets/icons/icon_camera_mobile.svg';
import CameraCustom from './drawer/cameraCustom';
import { ReactComponent as Home } from 'common/assets/icons/home.svg';
import { NavLink, useHistory } from 'react-router-dom';
import { useAppSelector } from 'Store/Store';

interface Props {
  onLoadingMobile?: any;
}

function FooterMobile(props: Props): JSX.Element {
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const history = useHistory();
  const { settings } = useAppSelector(state => state);

  return (
    <Box
      className="box-footer-mobile"
      display={'flex'}
      position={'relative'}
      alignItems={'center'}
      height={'100%'}
    >
      <NavLink
        style={{
          width: '70px',
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'center',
          backgroundColor:
            history.location.pathname === '/'
              ? `${settings.theme?.primaryColor}21`
              : '',
        }}
        activeClassName="active"
        to={'/'}
        className="nav-link p-0 menu-children rounded-0"
      >
        <Home
          color={
            history.location.pathname === '/'
              ? settings.theme?.primaryColor
              : '#000'
          }
        />
      </NavLink>
      <Box
        style={{ background: settings.theme?.primaryColor }}
        className="box-icon-camera-mobile"
      >
        <Button
          onClick={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        >
          <IconCameraMobile color="#FFFF" />
        </Button>
      </Box>

      <Box className="box-screenshot-camera">
        <CameraCustom
          isToggle={isOpenModalCamera}
          onToggleModal={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </Box>
    </Box>
  );
}

export default FooterMobile;
