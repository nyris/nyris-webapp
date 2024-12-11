import { useState } from 'react';

import CameraCustom from 'components/drawer/cameraCustom';

import { useAppSelector } from 'Store/Store';
import ExperienceVisualSearch from '../../components/Experience-visual-search/ExperienceVisualSearch';
import { Icon } from '@nyris/nyris-react-components';

function AppMobile({
  experienceVisualSearchBlobs,
}: {
  experienceVisualSearchBlobs: Blob[];
}): JSX.Element {
  const { settings } = useAppSelector(state => state);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  return (
    <div
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
      className="flex desktop:hidden"
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
              <Icon name="camera" color={'#2B2C46'} width={121} height={96} />
            </div>
          </div>
        </div>
      </div>
      <div className="box-screenshot-camera">
        <CameraCustom
          show={isOpenModalCamera}
          onClose={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </div>
      {settings.experienceVisualSearch ? (
        <ExperienceVisualSearch
          experienceVisualSearchBlobs={experienceVisualSearchBlobs}
        />
      ) : (
        ''
      )}
    </div>
  );
}

export default AppMobile;
