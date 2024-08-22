import React, { memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { createImage, find, findRegions } from 'services/image';
import {
  setSearchResults,
  setRequestImage,
  setImageSearchInput,
  updateStatusLoading,
  loadingActionResults,
  setRegions,
  setSelectedRegion,
  setShowFeedback,
  setFirstSearchResults,
  setFirstSearchImage,
  setFirstSearchPrefilters,
  setFirstSearchThumbSearchInput,
} from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { ReactComponent as IconDownload } from 'common/assets/icons/IconUploadDownward.svg';

import { RectCoords } from '@nyris/nyris-api';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';
import Loading from './Loading';

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
    onDrop: async (fs: File[], _, e) => {
      e.stopPropagation();
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
          values: Object.keys(preFilter),
        },
      ];
      let region: RectCoords | undefined;

      try {
        if (settings.regions) {
          let res = await findRegions(image, settings);
          dispatch(setRegions(res.regions));
          region = res.selectedRegion;
          dispatch(setSelectedRegion(region));
        }
      } catch (error) {
      } finally {
        return find({
          image,
          settings,
          region,
          filters: !isEmpty(preFilter) ? preFilterValues : undefined,
        }).then((res: any) => {
          res?.results.forEach((item: any) => {
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
          dispatch(setShowFeedback(true));
          // go back
          dispatch(setFirstSearchResults(payload));
          dispatch(setFirstSearchImage(image));
          dispatch(setFirstSearchPrefilters(preFilter));
          dispatch(setFirstSearchThumbSearchInput(URL.createObjectURL(fs[0])));
          return;
        });
      }
    },
  });

  return (
    <div
      className={`box-content-main`}
      style={{ marginTop: 32, paddingTop: 0, display: 'flex' }}
    >
      {isLoading && <Loading />}

      <div
        className={`box-border-none`}
        style={{ position: 'relative' }}
        {...getRootProps({
          onClick: e => {
            e.stopPropagation();
          },
        })}
      >
        <div
          className={`box-content-drop ${isDragActive ? 'drag-active' : ''}`}
          {...getRootProps({
            onClick: e => {
              e.stopPropagation();
            },
          })}
        >
          <div style={{ marginBottom: 16 }}>
            <IconDownload width={48} height={48} />
          </div>
          <label className="" style={{ fontSize: 14 }}>
            <span className="fw-700 text-f14" style={{ paddingRight: '4px' }}>
              {t('Drag and drop')}
            </span>
            {t('an image here')}
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
        </div>
      </div>
    </div>
  );
}

export default memo(DragDropFile);
