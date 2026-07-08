import toast, { ToastPosition } from 'react-hot-toast';
import { Icon } from '@nyris/nyris-react-components';
import React from 'react';

export class ToastHelper {
  static success(msg: string, position?: ToastPosition) {
    toast.success(msg, {
      duration: 5000,
      style: {
        background: window.nyrisSettings.primaryColor || '#1E1F31',
        color: window.nyrisSettings.browseGalleryButtonColor || '#fff',
      },
      position: position,
    });
  }

  static clipboardImageSearch(msg: string, position?: ToastPosition) {
    const primaryColor = window.nyrisSettings.primaryColor || '#3E36DC';
    const accentBackground =
      window.nyrisSettings.browseGalleryButtonColor || '#E4E3FF';

    toast(
      t => (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            width: 'min(340px, calc(100vw - 32px))',
            overflow: 'hidden',
            border: '1px solid #E3E7EF',
            borderRadius: 8,
            background: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(43, 44, 70, 0.14)',
            color: '#2B2C46',
            fontFamily: 'Source Sans 3, sans-serif',
          }}
        >
          <span
            style={{
              width: 4,
              background: primaryColor,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 16,
                background: accentBackground,
                color: primaryColor,
                flexShrink: 0,
              }}
            >
              <Icon name="camera_ai" width={16} height={16} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: '16px',
                }}
              >
                {msg}
              </span>
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => toast.dismiss(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                padding: 0,
                border: 0,
                borderRadius: 12,
                background: '#F3F3F5',
                color: '#55566B',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Icon name="close" width={10} height={10} />
            </button>
          </div>
        </div>
      ),
      {
        duration: 4000,
        position: position,
        style: {
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
          maxWidth: 'none',
        },
      },
    );
  }

  static error(msg: string, position?: ToastPosition) {
    toast.error(msg, {
      duration: 3000,
      style: {
        background: window.nyrisSettings.primaryColor || '#1E1F31',
        color: window.nyrisSettings.browseGalleryButtonColor || '#fff',
      },
      position: position,
    });
  }

  static emailError() {
    toast(
      t => {
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '14px',
              width: '294px',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Email not sent</span>
            <a
              href={`mailto:support@nyris.io?subject=Request for quotation&body=${encodeURIComponent(`Hello,
          I filled out the support form on the Search Suite, but it failed. I inquired the following:
          email:
          Pre-filter:
          Additional Text: `)}`}
              style={{
                padding: '8px 16px 8px 16px',
                border: '1px solid #000',
                marginTop: '16px',
                backgroundColor: 'transparent',
                color: '#000',
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              support@nyris.io
            </a>
          </div>
        );
      },
      {
        duration: 5000,
        style: {
          background: '#FFE5EF',
          color: '#000000',
          maxWidth: '400px',
        },
        icon: (
          <div style={{ minWidth: '20px', minHeight: '20px' }}>
            <Icon name="error" />
          </div>
        ),
      },
    );
  }
}
