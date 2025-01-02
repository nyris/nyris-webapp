import { Icon } from '@nyris/nyris-react-components';

import '../styles/mobileCameraCTA.scss';

function MobileCameraCTA({ setOpenModalCamera }: { setOpenModalCamera: any }) {
  return (
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
            setOpenModalCamera((s: any) => !s);
          }}
        >
          <div className="inner">
            <Icon name="camera" color={'#2B2C46'} width={121} height={96} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileCameraCTA;
