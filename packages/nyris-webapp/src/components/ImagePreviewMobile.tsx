import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { DEFAULT_REGION } from '../constants';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { useTranslation } from 'react-i18next';

function ImagePreviewMobile({
  requestImage,
  imageSelection,
  setImageSelection,
  debouncedOnImageSelectionChange,
  filteredRegions,
  showAdjustInfo,
  showAdjustInfoBasedOnConfidence,
}: {
  requestImage: any;
  imageSelection: any;
  setImageSelection: any;
  debouncedOnImageSelectionChange: any;
  filteredRegions: any;
  showAdjustInfoBasedOnConfidence: any;
  showAdjustInfo: any;
}) {
  const { t } = useTranslation();

  return (
    <Box
      className="col-left"
      style={{
        backgroundColor: '#AAABB5',
        marginBottom: '15px',
      }}
    >
      {
        <Box className="box-preview">
          <Box className="preview-item" style={{ backgroundColor: 'white' }}>
            <Preview
              key={requestImage?.id}
              onSelectionChange={(r: RectCoords) => {
                setImageSelection(r);
                debouncedOnImageSelectionChange(r);
              }}
              image={requestImage?.canvas}
              selection={imageSelection || DEFAULT_REGION}
              regions={filteredRegions}
              maxWidth={240}
              maxHeight={240}
              dotColor={'#FBD914'}
              minCropWidth={60}
              minCropHeight={60}
              rounded={false}
            />
          </Box>
          {(showAdjustInfoBasedOnConfidence || showAdjustInfo) && (
            <Box
              className="box-title_col-left"
              alignItems="center"
              style={{
                backgroundColor: '#3E36DC',
                display: 'flex',
                columnGap: '6px',
                padding: '5px',
                width: 'fit-content',
              }}
            >
              <IconInfo color="white" />
              <Typography
                style={{
                  fontSize: 10,
                  color: '#fff',
                }}
              >
                {showAdjustInfo
                  ? t('Crop the image for better results')
                  : 'Crop the image for better results'}
              </Typography>
            </Box>
          )}
        </Box>
      }
    </Box>
  );
}

export default ImagePreviewMobile;
