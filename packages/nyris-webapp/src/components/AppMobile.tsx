import React, { ReactNode, useState } from 'react';
import HeaderMobile from './HeaderMobile';
import { Box } from '@material-ui/core';
import {
  setPreFilterDropdown,
  setImageCaptureHelpModal,
} from 'Store/search/Search';
import { isUndefined } from 'lodash';
import ImageCaptureHelpModal from './ImageCaptureHelpModal';
import MobilePostFilter from './MobilePostFilter';
import PreFilterComponent from './pre-filter';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppState } from 'types';
import FooterMobile from './FooterMobile';

function AppMobile({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { search } = useAppSelector<AppState>((state: any) => state);
  const { preFilterDropdown, imageCaptureHelpModal } = search;
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);

  return (
    <>
      <div className="wrap-mobile">
        <div className="box-header-mobile-main">
          <HeaderMobile
            onToggleFilterMobile={(show: boolean) => {
              setOpenFilter(isUndefined(show) ? !isOpenFilter : show);
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
          }}
        >
          {children}
        </div>
        <div
          className="footer-wrap-main"
          style={{
            zIndex: 999,
          }}
        >
          <FooterMobile />
        </div>
      </div>
      <Box
        className={`box-filter ${isOpenFilter ? 'open' : 'close'} `}
        position={'absolute'}
        style={{
          top: '0px',
          height: '100%',
          width: '100%',
        }}
      >
        <MobilePostFilter
          onApply={() => {
            setOpenFilter(!isOpenFilter);
          }}
        />
      </Box>

      {preFilterDropdown && (
        <Box
          className={`box-filter open`}
          position={'absolute'}
          style={{ top: '0px', height: '100%', width: '100%', zIndex: 999 }}
        >
          <div style={{ width: '100%' }} className={'wrap-filter-desktop'}>
            <div className={'bg-white box-filter-desktop isMobile'}>
              <PreFilterComponent
                handleClose={() =>
                  dispatch(setPreFilterDropdown(!preFilterDropdown))
                }
              />
            </div>
          </div>
        </Box>
      )}

      {imageCaptureHelpModal && (
        <Box
          className={`box-filter open`}
          position={'absolute'}
          style={{
            top: '0px',
            width: '100%',
            zIndex: 100,
          }}
        >
          <div style={{ width: '100%' }} className={'wrap-filter-desktop'}>
            <div className={'bg-white box-filter-desktop isMobile'}>
              <ImageCaptureHelpModal
                handleClose={() =>
                  dispatch(setImageCaptureHelpModal(!imageCaptureHelpModal))
                }
              />
            </div>
          </div>
        </Box>
      )}
    </>
  );
}

export default AppMobile;
