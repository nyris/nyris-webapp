import React from 'react';
import toast, {
  resolveValue,
  ToastBar,
  Toaster as ReactHotToaster,
} from 'react-hot-toast';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { useMediaQuery } from 'react-responsive';

export const Toaster = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  return (
    <ReactHotToaster
      containerStyle={!isMobile ? { top: 60 } : { bottom: 80 }}
      position={isMobile ? 'bottom-center' : 'top-right'}
    >
      {t => (
        <ToastBar toast={t} style={{ padding: 0, borderRadius: 0 }}>
          {({ icon }) => (
            <>
              <span
                style={{
                  width: 5,
                  height: '100%',
                  background: t.type === 'success' ? '#61d345' : 'transparent',
                  marginRight: 7,
                }}
              />
              <span style={{ padding: 15, display: 'inline-flex' }}>
                {icon}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 300,
                    margin: '0 10px',
                  }}
                >
                  {' '}
                  {resolveValue(t.message, t)}
                </span>
                {t.type !== 'loading' && (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <CloseOutlinedIcon
                      fontSize="small"
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
