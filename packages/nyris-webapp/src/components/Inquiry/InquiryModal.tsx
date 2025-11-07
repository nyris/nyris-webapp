import React, { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { isUndefined } from 'lodash';
import toast from 'react-hot-toast';

import { Icon } from '@nyris/nyris-react-components';

import useRequestStore from 'stores/request/requestStore';
import { getCroppedCanvas } from 'utils/misc';
import { ToastHelper } from 'helpers/ToastHelper';
import { Dialog, DialogContent } from 'components/Modal/Dialog';
import { AutosizeTextarea } from 'components/AutosizeTextArea';
import Tooltip from 'components/Tooltip/TooltipComponent';

import { useTranslation } from 'react-i18next';
import { createImage } from '../../services/visualSearch';
interface Props {
  requestImage: any;
  selectedRegion: any;
  setIsInquiryModalOpen: any;
  isInquiryModalOpen?: any;
}
// eslint-disable-next-line
const emailRegex = /.+\@.+\..+$/;

const getErrorMessage = (error: any) => {
  switch (error.status) {
    case 400:
      return 'Your email could not be sent, please try again or send an email to:';
    case 421:
    case 450:
    case 451:
    case 452:
      return "Email delivery failed. Rest assured, we're continuously attempting to send it for you. Alternatively, you can forward the email to:";
    default:
      return 'Your email could not be sent, please try again or send an email to:';
  }
};

export default function InquiryModal({
  requestImage,
  selectedRegion,
  setIsInquiryModalOpen,
  isInquiryModalOpen,
}: Props) {
  const settings = window.settings;
  const preFilter = useRequestStore(state => state.preFilter);
  const specifications = useRequestStore(state => state.specifications);
  const nameplateImage = useRequestStore(state => state.nameplateImage);

  const preFilterValues = Object.keys(preFilter) as string[];

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | undefined>(undefined);

  const [information, setInformation] = useState('');

  const setFormattedContent = React.useCallback(
    (text: string) => {
      setInformation(text.slice(0, 150));
    },
    [setInformation],
  );
  const { t } = useTranslation();

  useEffect(() => {
    function omitKeys(obj: any, keys: string[]) {
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key))
      );
    }
    const omittedSpecification = omitKeys(specifications, ['is_nameplate', '']);
    setInformation(
      Object
        .entries(omittedSpecification)
        .reduce((acc, [k, v]) =>
            v == null || (typeof v === 'string' && v.trim() === '')
              ? acc
              : `${acc}${k}: ${v}\n`,
          ''
        )
      );
  }, [specifications]);

  useEffect(() => emailjs.init('SMGihPnuEGcYLm0V4'), []);
  useEffect(() => {
    if (email)
      emailRegex.test(email) ? setEmailValid(true) : setEmailValid(false);
  }, [email]);

  const handleInquiry = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const croppedImage = requestImage
      ? getCroppedCanvas(requestImage, selectedRegion)
      : null;
    const nameplateImageCanvas = nameplateImage ? await createImage(nameplateImage) : null;
    
    const serviceId = 'service_zfsxshi';
    setIsInquiryModalOpen(false);
    const templateId = settings.support?.emailTemplateId;
    if (templateId) {
      const body = !specifications?.is_nameplate ? {
        email_id: email.trim(),
        information_text: information ? information : '<not specified>',
        request_image: croppedImage?.toDataURL(),
        prefilter_values: preFilterValues?.length
          ? preFilterValues.join(', ')
          : '<not specified>',
      } : {
        email_id: email.trim(),
        information_text: information,
        request_image: croppedImage?.toDataURL() || '',
        typeplate_image: nameplateImageCanvas?.toDataURL() || '',
        prefilter_values: specifications.prefilter_value,
      };
      try {
        await emailjs.send(serviceId, templateId, body);
        ToastHelper.success(t('Request sent successfully'));
      } catch (error) {
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
      setIsInquiryModalOpen(false);
    }
  };

  return (
    <Dialog
      open={isInquiryModalOpen}
      onOpenChange={(e: any) => {
        setIsInquiryModalOpen(false);
      }}
    >
      <DialogContent
        closeButton={false}
        className="w-[360px] desktop:w-[378px] flex flex-col bg-white p-0"
      >
        <div>
          <div
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p
              style={{
                color: '#2B2C46',
                fontWeight: 'bold',
              }}
            >
              {requestImage
                ? t('Submit your image for inquiry')
                : t('Submit your inquiry')}
            </p>
            <div
              onClick={() => setIsInquiryModalOpen(false)}
              style={{ display: 'flex', padding: '1px' }}
            >
              <Icon
                name="close"
                style={{
                  fontSize: 16,
                  color: 'black',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
          {requestImage && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#F3F3F5',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={getCroppedCanvas(
                  requestImage,
                  selectedRegion,
                )?.toDataURL()}
                alt="request_image"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          <div
            style={{
              padding: '16px 16px 16px 16px',
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
                {t('Your email (required)')}
              </p>
              <input
                value={email}
                onChange={e => setEmail(e.currentTarget.value.trim())}
                style={{
                  width: '100%',
                  border: 'none',
                  height: '32px',
                  padding: '8px 16px 8px 16px',
                  fontSize: '13px',
                  color: ' #2B2C46',
                }}
                className="outline-none"
              />
              {!emailValid && !isUndefined(emailValid) && (
                <p
                  style={{ color: 'red', fontSize: '12px', paddingTop: '8px' }}
                >
                  {t('Please enter a valid email.')}
                </p>
              )}
            </div>
            {settings.preFilterOption && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    columnGap: '4px',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#2B2C46',
                    }}
                  >
                    {settings.support.prefilterFieldName}
                  </p>
                  <Tooltip
                    content={t(
                      'Please select a search criteria before search request to refine and yield accurate results.',
                    )}
                  >
                    <div>
                      <Icon
                        name="info"
                        style={{ cursor: 'pointer' }}
                        width={12}
                        height={12}
                      />
                    </div>
                  </Tooltip>
                </div>

                <div
                  style={{
                    width: '100%',
                    border: 'none',
                    padding: '8px 16px 8px 16px',
                    fontSize: '13px',
                    color: '#2B2C46',
                    minHeight: '32px',
                    backgroundColor: '#fff',
                  }}
                >
                  {preFilterValues.join(', ') ||
                    t('Search criteria is not selected')}
                </div>
              </div>
            )}

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
                  minHeight: '40px',
                  padding: '8px 16px 8px 16px',
                  fontSize: '13px',
                  color: ' #2B2C46',
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
                backgroundColor: '#2B2C46',
                color: 'white',
                fontSize: '14px',
                paddingLeft: '16px',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setIsInquiryModalOpen(false)}
            >
              {t('Cancel')}
            </button>
            <button
              style={{
                height: '66px',
                display: 'flex',
                alignItems: 'center',
                width: '50%',
                backgroundColor: emailValid
                  ? settings.theme?.primaryColor
                  : '#E9E9EC',
                color: emailValid ? '#fff' : '#AAABB5',
                fontSize: '14px',
                paddingLeft: '16px',
                border: 'none',
                cursor: emailValid ? 'pointer' : 'normal',
              }}
              disabled={!emailValid}
              onClick={handleInquiry}
            >
              {t('Send')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
