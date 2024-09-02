import { useState } from 'react';
import PostFilterPanel from './PanelResult/PostFilter';
import PostFilterPanelAlgolia from './PanelResult/PostFilterAlgolia';

import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'Store/Store';

import ImagePreview from './ImagePreview';

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
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;

  const { requestImage } = search;

  return (
    <div
      className={`wrap-main-col-left`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {settings.preview && requestImage && (
          <div className="col-left">
            <div className="box-preview">
              <div
                className="preview-item"
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <ImagePreview
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
