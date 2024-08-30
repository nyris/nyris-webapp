import { Button, Typography } from '@material-ui/core';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import React, { useState } from 'react';
import PostFilterPanel from './PanelResult/PostFilter';
import PostFilterPanelAlgolia from './PanelResult/PostFilterAlgolia';

import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'Store/Store';
import { ReactComponent as KeyboardArrowRightOutlinedIcon } from 'common/assets/icons/arrow_right.svg';
import { ReactComponent as KeyboardArrowLeftOutlinedIcon } from 'common/assets/icons/arrow_left.svg';

import { DEFAULT_REGION } from '../constants';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import ImagePreviewMobile from './ImagePreviewMobile';

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
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;

  const { requestImage } = search;

  return (
    <div
      className={`wrap-main-col-left ${toggleColLeft ? 'toggle' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        className="box-toggle-coloumn"
        style={{
          right: '0px',
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
      </div>
      <div>
        {settings.preview && requestImage && (
          <div className="col-left">
            <div className="box-preview">
              <div
                className="preview-item"
                style={{
                  backgroundColor: 'white',
                  paddingTop: '32px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  {/* <div
                    style={{
                      width: '288px',
                      height: 'fit-content',
                    }}
                  >
                    <Preview
                      key={requestImage?.id}
                      onSelectionChange={(r: RectCoords) => {
                        debouncedOnImageSelectionChange(r);
                      }}
                      image={requestImage?.canvas}
                      selection={imageSelection || DEFAULT_REGION}
                      regions={filteredRegions}
                      dotColor={'#FBD914'}
                      minCropWidth={30}
                      minCropHeight={30}
                      rounded={true}
                    />
                  </div> */}
                  <ImagePreviewMobile
                    debouncedOnImageSelectionChange={
                      debouncedOnImageSelectionChange
                    }
                    showAdjustInfoBasedOnConfidence={
                      showAdjustInfoBasedOnConfidence
                    }
                    showAdjustInfo={showAdjustInfo}
                    isExpanded={true}
                    isCameraUploadEnabled={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showPostFilter && (
          <div
            className="col-left__bottom"
            style={{
              marginTop: requestImage ? '16px' : '48px',
            }}
          >
            {settings.algolia.enabled && (
              <PostFilterPanelAlgolia disjunctiveFacets={disjunctiveFacets} />
            )}
            {!settings.algolia.enabled && <PostFilterPanel />}
          </div>
        )}
      </div>
    </div>
  );
}

export default SidePanel;
