import { Icon } from '@nyris/nyris-react-components';

import '../styles/mobileCameraCTA.scss';

function MobileCameraCTA({ setOpenModalCamera }: { setOpenModalCamera: any }) {
  return (
    <div className="take-photo">
      <div
        className="take-photo-wrapper"
      >
        <div
          className="outer"
          onClick={() => {
            setOpenModalCamera((s: any) => !s);
          }}
        >
          <div className="inner">
            <Icon name="mobile_camera" color={'#2B2C46'} width={121} height={120} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileCameraCTA;
