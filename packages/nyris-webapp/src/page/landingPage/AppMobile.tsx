import { Box } from '@material-ui/core';
import CameraCustom from 'components/drawer/cameraCustom';
import React, { useEffect, useState } from 'react';
import { reset } from 'Store/search/Search';
import { useAppDispatch } from 'Store/Store';
import { ReactComponent as CameraIcon } from 'common/assets/icons/take_photo.svg';

function AppMobile(): JSX.Element {
  const dispatch = useAppDispatch();
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  useEffect(() => {
    dispatch(reset(''));
  }, [dispatch]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div className="take-photo">
        <div
          className="take-photo-wrapper"
          style={{
            background: 'linear-gradient(90deg, #55566B 0%, #2B2C46 100%)',
          }}
        >
          <div
            className="outer"
            onClick={() => {
              setOpenModalCamera(!isOpenModalCamera);
            }}
          >
            <div className="inner">
              <CameraIcon color={'#2B2C46'} />
            </div>
          </div>
        </div>
      </div>
      <Box className="box-screenshot-camera">
        <CameraCustom
          isToggle={isOpenModalCamera}
          onToggleModal={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </Box>
    </div>
  );
}

export default AppMobile;
