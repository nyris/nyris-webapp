import React, { useEffect, useState } from 'react';
import { Icon } from '@nyris/nyris-react-components';
import { isUndefined } from 'lodash';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

import { AutosizeTextarea } from 'components/AutosizeTextArea';
import { Dialog, DialogContent } from 'components/Modal/Dialog';
import { getCroppedCanvas } from 'utils/misc';
import { ToastHelper } from 'helpers/ToastHelper';
import useRequestStore from 'stores/request/requestStore';

import { useTranslation } from 'react-i18next';
interface Props {
  setIsRfqModalOpen: any;
  isRfqModalOpen?: any;
  setRfqStatus: any;
}
// eslint-disable-next-line
const emailRegex = /.+\@.+\..+$/;

const getErrorMessage = (error: any) => {
  switch (error.status) {
    case 400:
      return 'Your email could not be sent, please try again or send an email to support@nyris.io';
    case 421:
    case 450:
    case 451:
    case 452:
      return "Email delivery failed. Rest assured, we're continuously attempting to send it for you. Alternatively, you can forward the email to support@nyris.io";
    default:
      return 'Your email could not be sent, please try again or send an email to support@nyris.io';
  }
};

export default function RfqModal({
  setIsRfqModalOpen,
  isRfqModalOpen,
  setRfqStatus,
}: Props) {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | undefined>(undefined);
  const { settings } = window;

  const [information, setInformation] = useState('');

  const requestImages = useRequestStore(state => state.requestImages);
  const regions = useRequestStore(state => state.regions);

  const setFormattedContent = React.useCallback(
    (text: string) => {
      setInformation(text.slice(0, 150));
    },
    [setInformation],
  );
  useEffect(() => emailjs.init('SMGihPnuEGcYLm0V4'), []);
  useEffect(() => {
    if (email)
      emailRegex.test(email) ? setEmailValid(true) : setEmailValid(false);
  }, [email]);

  const handleRfq = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const canvas: any = requestImages[0];
    const croppedImage = getCroppedCanvas(canvas, regions[0]);
    const serviceId = 'service_zfsxshi';
    setIsRfqModalOpen(false);
    const templateId = settings.rfq?.emailTemplateId;

    if (templateId) {
      try {
        setRfqStatus('loading');
        await emailjs.send(serviceId, templateId, {
          email_id: email.trim(),
          information_text: information,
          request_image: croppedImage?.toDataURL(),
        });
        setRfqStatus('sent');
        ToastHelper.success(t('Request sent successfully'));
      } catch (error) {
        setRfqStatus('inactive');

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
                <span>{getErrorMessage(error)}</span>
                <a
                  href={`mailto:support@nyris.io?subject=Request for quotation&body=${information}`}
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
      setIsRfqModalOpen(false);
    }
  };

  const { t } = useTranslation();

  return (
    <Dialog open={isRfqModalOpen} onOpenChange={() => setIsRfqModalOpen(false)}>
      <DialogContent
        closeButton={false}
        className="w-[360px] desktop:w-[378px] flex flex-col bg-white p-0"
      >
        <div>
          <div
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Icon
              name="close"
              style={{
                fontSize: 16,
                color: 'black',
                alignSelf: 'flex-end',
                cursor: 'pointer',
              }}
              onClick={() => setIsRfqModalOpen(false)}
            />
            <p
              style={{
                color: '#2B2C46',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              Submit your image for quotation
            </p>
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F3F3F5',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={getCroppedCanvas(requestImages[0], regions[0])?.toDataURL()}
              alt="request_image"
              style={{ maxHeight: '200px' }}
            />
          </div>
          <div
            style={{
              padding: '0px 16px 16px 16px',
              backgroundColor: '#F3F3F5',
              display: 'flex',
              flexDirection: 'column',
              rowGap: '16px',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#2B2C46',
                  marginBottom: '8px',
                }}
              >
                Your email (required)
              </p>
              <input
                value={email}
                onChange={e => setEmail(e.currentTarget.value.trim())}
                style={{
                  width: '100%',
                  border: 'none',
                  height: '32px',
                  padding: '8px 16px 8px 16px',
                }}
              />
              {!emailValid && !isUndefined(emailValid) && (
                <p
                  style={{ color: 'red', fontSize: '12px', paddingTop: '8px' }}
                >
                  Please enter a valid email.
                </p>
              )}
            </div>
            <div>
              <div
                style={{
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#2B2C46',
                }}
              >
                <p>Additional information</p>
                <p>{`${information.length}/150`}</p>
              </div>
              <AutosizeTextarea
                value={information}
                onChange={e => setFormattedContent(e.currentTarget.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  maxWidth: '346px',
                  padding: '8px 16px 8px 16px',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <button
              style={{
                height: '66px',
                display: 'flex',
                alignItems: 'center',
                width: '50%',
                backgroundColor: '#4B4B4A',
                color: 'white',
                fontSize: '14px',
                paddingLeft: '16px',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setIsRfqModalOpen(false)}
            >
              {t('Cancel')}
            </button>
            <button
              style={{
                height: '66px',
                display: 'flex',
                alignItems: 'center',
                width: '50%',
                backgroundColor: emailValid ? '#4DBE51' : '#E9E9EC',
                color: emailValid ? '#fff' : '#AAABB5',
                fontSize: '14px',
                paddingLeft: '16px',
                border: 'none',
                cursor: emailValid ? 'pointer' : 'normal',
              }}
              disabled={!emailValid}
              onClick={handleRfq}
            >
              {t('Send')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
