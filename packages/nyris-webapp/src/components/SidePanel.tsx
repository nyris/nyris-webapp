import { Box, Button, Typography } from '@material-ui/core';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import React, { useState } from 'react';
import ExpandablePanelComponent from './PanelResult';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'Store/Store';
import KeyboardArrowRightOutlinedIcon from '@material-ui/icons/KeyboardArrowRightOutlined';
import KeyboardArrowLeftOutlinedIcon from '@material-ui/icons/KeyboardArrowLeftOutlined';
import { DEFAULT_REGION } from '../constants';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';

function SidePanel({
  setImageSelection,
  imageSelection,
  debouncedOnImageSelectionChange,
  filteredRegions,
  showAdjustInfoBasedOnConfidence,
  showAdjustInfo,
  showPostFilter,
  disjunctiveFacets,
}: {
  setImageSelection: any;
  imageSelection: any;
  debouncedOnImageSelectionChange: any;
  filteredRegions: any;
  showAdjustInfoBasedOnConfidence: any;
  showAdjustInfo: any;
  showPostFilter: any;
  allSearchResults: any;
  disjunctiveFacets: any;
}) {
  const { t } = useTranslation();
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
  const stateGlobal = useAppSelector((state: any) => state);
  const { search, settings } = stateGlobal;

  const { requestImage } = search;

  return (
    <Box
      className={`wrap-main-col-left ${toggleColLeft ? 'toggle' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        className="box-toggle-coloumn"
        style={{
          right: requestImage || toggleColLeft ? '0px' : '16px',
        }}
      >
        <Button
          style={{
            color: '#55566b',
            height: '32px',
          }}
          onClick={() => {
            setToggleColLeft(!toggleColLeft);
          }}
        >
          {toggleColLeft ? (
            <KeyboardArrowRightOutlinedIcon />
          ) : (
            <KeyboardArrowLeftOutlinedIcon />
          )}
        </Button>
      </Box>
      <Box>
        {settings.preview && requestImage && (
          <Box className="col-left">
            <Box className="box-preview">
              <Box
                className="preview-item"
                style={{
                  backgroundColor: 'white',
                  paddingTop: '32px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#F3F3F5',
                    width: '100%',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                  }}
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
                    maxWidth={288}
                    maxHeight={288}
                    dotColor={'#FBD914'}
                    minCropWidth={60}
                    minCropHeight={60}
                    rounded={true}
                  />
                </div>
              </Box>
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
        )}

        {showPostFilter && (
          <Box className="col-left__bottom">
            <ExpandablePanelComponent disjunctiveFacets={disjunctiveFacets} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SidePanel;
