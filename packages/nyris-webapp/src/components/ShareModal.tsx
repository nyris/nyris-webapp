import { Box, Button, IconButton, Paper, Typography } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import IconEmail from '../common/assets/icons/email_share.svg';
import DefaultModal from './modal/DefaultModal';
import React, { Dispatch } from 'react';

type PropsType = {
  dataItem: any;
  isOpen: boolean;
  setModalState: Dispatch<React.SetStateAction<boolean>>;
};

export const ShareModal = (props: PropsType) => {
  const { dataItem, isOpen, setModalState } = props;
  const main_image_link =
    dataItem['image(main_similarity)'] || dataItem['main_image_link'];
  return (
    <DefaultModal openModal={isOpen} handleClose={() => setModalState(false)}>
      <Box
        className="box-modal-default box-modal-share"
        style={{ padding: '4px' }}
      >
        <Box
          className="ml-auto"
          style={{ width: 'fit-content', marginRight: 5 }}
        >
          <Button style={{ padding: 0 }} onClick={() => setModalState(false)}>
            <CloseOutlinedIcon style={{ fontSize: 16, color: '#55566B' }} />
          </Button>
        </Box>
        <Box className="box-content-box-share">
          <Typography
            className="text-f12 text-gray text-bold"
            style={{ marginBottom: '5px' }}
          >
            Share
          </Typography>
          {main_image_link && (
            <Paper component="form" className="box-input">
              <Box
                className="text-f9 text-gray"
                style={{
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '10px',
                }}
              >
                {main_image_link}
              </Box>
              <IconButton
                color="secondary"
                aria-label="directions"
                style={{ padding: '4px' }}
                onClick={() => {
                  navigator.clipboard.writeText(main_image_link);
                }}
              >
                <FileCopyOutlinedIcon style={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          )}

          <Paper
            component="form"
            className="box-input"
            style={{ marginTop: '12px', marginBottom: '8px' }}
          >
            <Box
              className="text-f9 text-gray"
              style={{
                width: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                paddingRight: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 'bold', paddingRight: '4px' }}>
                SKU:
              </span>{' '}
              {dataItem.sku}
            </Box>
            <IconButton
              color="secondary"
              aria-label="directions"
              style={{ padding: '4px' }}
              onClick={() => {
                navigator.clipboard.writeText(dataItem.sku);
              }}
            >
              <FileCopyOutlinedIcon style={{ fontSize: 14 }} />
            </IconButton>
          </Paper>
          <Box
            className="box-media-share"
            display={'flex'}
            style={{ marginTop: '18px' }}
          >
            <a
              style={{ padding: 0 }}
              href={`mailto:support@nyris.io?subject=GF-Sparepart-Search&body= ${encodeURIComponent(
                'SKU: ' +
                  dataItem.sku +
                  '\r\n' +
                  (main_image_link ? `Image Link: ${main_image_link}` : ''),
              )} `}
            >
              <Box display={'flex'} alignItems={'center'}>
                <img width={40} height={40} src={IconEmail} alt="icon_email" />
              </Box>
            </a>
            {/* <Button style={{ padding: 0, margin: '0 20px' }}>
                <Box display={'flex'} alignItems={'center'}>
                  <img
                    src={IconWeChat}
                    width={40}
                    height={40}
                    alt="icon_email"
                  />
                </Box>
              </Button>
              <Button style={{ padding: 0 }}>
                <Box display={'flex'} alignItems={'center'}>
                  <img
                    src={IconWhatsApp}
                    width={40}
                    height={40}
                    alt="icon_email"
                  />
                </Box>
              </Button> */}
          </Box>
        </Box>
      </Box>
    </DefaultModal>
  );
};