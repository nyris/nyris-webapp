import { useMediaQuery } from 'react-responsive';

import { Icon } from '@nyris/nyris-react-components';

import toast, {
  resolveValue,
  ToastBar,
  Toaster as ReactHotToaster,
} from 'react-hot-toast';

export const Toaster = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  return (
    <ReactHotToaster
      position={isMobile ? 'bottom-center' : 'top-right'}
      containerStyle={{
        top: 80,
        bottom: isMobile ? 80 : 'auto',
      }}
    >
      {t => (
        <ToastBar
          toast={t}
          style={{
            padding: 0,
            borderRadius: 0,
            width: !isMobile ? 410 : undefined,
          }}
        >
          {({ icon }) => (
            <>
              <span
                style={{
                  width: 5,
                  height: '100%',
                  background: t.type === 'success' ? '#3E36DC' : 'transparent',
                  marginRight: 7,
                }}
              />
              <span
                style={{
                  padding: 15,
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div className="flex items-center justify-center">
                  {icon}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: '0 10px',
                    }}
                  >
                    {' '}
                    {resolveValue(t.message, t)}
                  </span>
                </div>
                {t.type !== 'loading' && (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon
                      className="w-3 h-3"
                      name="close"
                      style={{ cursor: 'pointer', marginLeft: 10 }}
                      onClick={() => toast.dismiss(t.id)}
                    />
                  </span>
                )}
              </span>
            </>
          )}
        </ToastBar>
      )}
    </ReactHotToaster>
  );
};
