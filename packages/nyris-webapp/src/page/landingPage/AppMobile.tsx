import CameraCustom from 'components/drawer/cameraCustom';
import React, { useEffect, useState } from 'react';
import { reset } from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ReactComponent as CameraIcon } from 'common/assets/icons/take_photo.svg';
import ExperienceVisualSearch from "../../components/Experience-visual-search/ExperienceVisualSearch";

function AppMobile(): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);
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
      <div className="box-screenshot-camera">
        <CameraCustom
          isToggle={isOpenModalCamera}
          onToggleModal={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </div>
      {settings.experienceVisualSearch ? (
        <ExperienceVisualSearch />
      ) : (
        ''
      )}
    </div>
  );
}

export default AppMobile;
