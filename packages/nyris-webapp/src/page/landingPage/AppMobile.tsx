import CameraCustom from 'components/drawer/cameraCustom';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'Store/Store';
import { ReactComponent as CameraIcon } from 'common/assets/icons/take_photo.svg';
import ExperienceVisualSearch from '../../components/Experience-visual-search/ExperienceVisualSearch';

function AppMobile(): JSX.Element {
  const { settings } = useAppSelector(state => state);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  useEffect(() => {
    if (settings.clarityId) {
      clarify(window, document, 'clarity', 'script', settings.clarityId);
    }
  }, [settings.clarityId]);

  const clarify = function (
    c: any,
    l: Document,
    a: string,
    r: string,
    i: string
  ) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    const t: any = l.createElement(r);
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    if (y.parentNode) {
      y.parentNode.insertBefore(t, y);
    }
  };

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
