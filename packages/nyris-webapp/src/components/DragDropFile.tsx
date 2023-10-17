import { Box } from '@material-ui/core';
import React, { memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { createImage, findByImage, findRegions } from 'services/image';
import {
  setSearchResults,
  setRequestImage,
  setImageSearchInput,
  updateStatusLoading,
  loadingActionResults,
  setRegions,
  setSelectedRegion,
} from 'Store/search/Search';
import { showFeedback } from 'Store/nyris/Nyris';
import { useHistory } from 'react-router-dom';
import { ReactComponent as IconDownload } from 'common/assets/icons/IconUploadDownward.svg';

import { RectCoords } from '@nyris/nyris-api';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';

interface Props {
  acceptTypes: any;
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { onChangeLoading, isLoading } = props;
  const searchState = useAppSelector(state => state);
  const {
    settings,
    search: { preFilter },
  } = searchState;
  const { t } = useTranslation();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[]) => {
      history.push('/result');
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      onChangeLoading(true);
      let payload: any;
      let filters: any[] = [];
      console.log('fs', fs);
      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter) as string[],
        },
      ];
      let region: RectCoords | undefined;
      if (settings.regions) {
        let res = await findRegions(image, settings);
        dispatch(setRegions(res.regions));
        region = res.selectedRegion;
        dispatch(setSelectedRegion(region));
      }

      return findByImage({
        image,
        settings,
        region,
        filters: !isEmpty(preFilter) ? preFilterValues : undefined,
      }).then((res: any) => {
        res?.results.map((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        payload = {
          ...res,
          filters,
        };
        dispatch(setSearchResults(payload));
        onChangeLoading(false);
        dispatch(updateStatusLoading(false));
        return dispatch(showFeedback());
      });
    },
  });

  return (
    <Box className={`box-content-main`} style={{ marginTop: 16 }}>
      {isLoading && (
        <Box className="loadingSpinCT">
          <Box className="box-content-spin"></Box>
        </Box>
      )}

      <div
        className={`box-border-none`}
        style={{ position: 'relative' }}
        {...getRootProps({
          onClick: e => {
            e.stopPropagation();
          },
        })}
      >
        <>
          <Box
            className={`box-content-drop ${isDragActive ? 'drag-active' : ''}`}
            {...getRootProps({
              onClick: e => {
                e.stopPropagation();
              },
            })}
          >
            <Box style={{ marginBottom: 16 }}>
              <IconDownload width={48} height={48} />
            </Box>
            <label htmlFor="select_file" className="" style={{ fontSize: 14 }}>
              <span className="fw-700 text-f14" style={{ paddingRight: '4px' }}>
                {t('Choose an image')}
              </span>
              {t('or drag it here')}
            </label>
            <input
              {...getInputProps()}
              type="file"
              name="file"
              id="select_file"
              className="inputFile"
              placeholder="Choose photo"
              style={{ display: 'block', cursor: 'pointer' }}
            />
          </Box>
        </>
      </div>
    </Box>
  );
}

export default memo(DragDropFile);
