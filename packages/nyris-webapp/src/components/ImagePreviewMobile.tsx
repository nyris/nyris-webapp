import React, { memo, useState } from 'react';
import { Box, Typography, Hidden } from '@material-ui/core';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { DEFAULT_REGION } from '../constants';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'Store/Store';
import { ReactComponent as ArrowUp } from 'common/assets/icons/arrow_up.svg';
import { ReactComponent as ArrowDown } from 'common/assets/icons/arrow_down.svg';
import { ReactComponent as Trash } from 'common/assets/icons/trash.svg';
import { useQuery } from 'hooks/useQuery';
import { reset } from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { connectSearchBox } from 'react-instantsearch-dom';

function ImagePreviewMobileComponent({
  requestImage,
  imageSelection,
  setImageSelection,
  debouncedOnImageSelectionChange,
  filteredRegions,
  showAdjustInfo,
  showAdjustInfoBasedOnConfidence,
  ...rest
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
  const { refine }: any = rest;
  const [editActive, setEditActive] = useState(false);
  const [showShrinkAnimation, setShrinkAnimation] = useState(false);
  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const handleArrowClick = () => {
    setEditActive(s => !s);
    setShrinkAnimation(true);
  };

  const onImageRemove = () => {
    const searchQuery = query.get('query') || '';

    if (!searchQuery) {
      dispatch(reset(''));
      history.push('/');
    }
    dispatch(reset(''));

    // not an ideal solution: fixes text search not working after removing image
    setTimeout(() => {
      refine(searchQuery);
    }, 100);
  };

  return (
    <Box
      className="col-left"
      style={{
        backgroundColor: '#5D5D63',
        marginBottom: '15px',
      }}
    >
      {editActive && (
        <div>
          <Box className="box-preview">
            <Box
              className="preview-item expand-animation"
              style={{ backgroundColor: 'transparent' }}
            >
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
                expandAnimation={true}
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
          <Hidden>
            <Box
              sx={{
                position: 'absolute',
                left: '15px',
                top: '25px',
                padding: '4px',
              }}
              onClick={onImageRemove}
            >
              <Box
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <Trash color="white" fill="white" />
              </Box>
            </Box>
          </Hidden>

          <Hidden mdUp>
            <Box
              className="slideDown"
              sx={{
                position: 'absolute',
                bottom: '25px',
                right: '20px',
              }}
              onClick={handleArrowClick}
            >
              <Box
                bgcolor={'white'}
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <ArrowUp color="black" />
              </Box>
            </Box>
          </Hidden>
        </div>
      )}
      {!editActive && (
        <Box
          className={showShrinkAnimation ? 'shrink-animation' : ''}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 80,
            width: '100%',
          }}
        >
          <Hidden>
            <Box
              sx={{
                position: 'absolute',
                left: '15px',
                top: '25px',
                padding: '4px',
              }}
              onClick={onImageRemove}
            >
              <Box
                // className={showShrinkAnimation ? 'slideUp' : ''}
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <Trash color="white" fill="white" />
              </Box>
            </Box>
          </Hidden>
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={handleArrowClick}
          >
            {requestImage && requestImage?.canvas?.toDataURL && (
              <img
                src={requestImage?.canvas?.toDataURL()}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                alt="preview"
              />
            )}

            <div
              className={
                showShrinkAnimation
                  ? 'shrink-animation circle-layer'
                  : 'circle-layer'
              }
            ></div>
          </Box>
          <Hidden mdUp>
            <Box
              sx={{
                position: 'absolute',
                right: '25px',
                padding: '4px',
              }}
              onClick={handleArrowClick}
            >
              <Box
                bgcolor={'white'}
                className={showShrinkAnimation ? 'slideUp' : ''}
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <ArrowDown color="black" fill="black" />
              </Box>
            </Box>
          </Hidden>
        </Box>
      )}
    </Box>
  );
}
const ImagePreviewMobile = connectSearchBox<any>(
  memo(ImagePreviewMobileComponent),
);
export default ImagePreviewMobile;
