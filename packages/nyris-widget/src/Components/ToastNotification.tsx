import toast, { ToastPosition } from 'react-hot-toast';
import {Icon} from "@nyris/nyris-react-components";
import React from "react";

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
  
  static emailError () {
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
