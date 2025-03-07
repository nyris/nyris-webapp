import { Icon } from '@nyris/nyris-react-components';
import { visualSearchHelp } from '../constants';

interface Props {
  handleClose: any;
}

function ImageCaptureHelpModal({ handleClose }: Props) {
  return (
    <div className="bg-white pb-6 h-full overflow-auto">
      <div
        style={{
          display: 'flex',
          justifyContent: 'end',
          position: 'sticky',
          top: 0,
          background: 'white',
          width: '100%',
        }}
      >
        <button
          onClick={handleClose}
          style={{ paddingTop: '8px', paddingRight: '8px' }}
        >
          <Icon name="close" />
        </button>
      </div>
      <div>
        <p
          style={{
            fontSize: '40px',
            lineHeight: '40px',
            fontWeight: 700,
            color: '#2B2C46',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          Six ways to optimize visual search
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '16px',
            marginTop: '16px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          {visualSearchHelp.map((data, index) => {
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '8px',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 700,
                    color: '#2B2C46',
                    marginBottom: '0px',
                  }}
                >
                  {`${index + 1}- ${data.title}`}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: 400,
                    color: '#2B2C46',
                    marginBottom: '0px',
                  }}
                >
                  {data.description}
                </p>
                <div style={{ display: 'flex', columnGap: '16px' }}>
                  <div>
                    <img src={data.imageLeft} alt="" />
                  </div>
                  <div>
                    <img src={data.imageRight} alt="" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ImageCaptureHelpModal;
