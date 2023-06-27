import { Box, Typography } from '@material-ui/core';
import React, { memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { makeFileHandler } from '@nyris/nyris-react-components';
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
import { useState } from 'react';
import IconUpload from 'common/assets/images/Icon_Upload.svg';
import { RectCoords } from '@nyris/nyris-api';
import { useTranslation } from 'react-i18next';
import heic2any from 'heic2any';

interface Props {
  acceptTypes: any;
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { acceptTypes, onChangeLoading, isLoading } = props;
  const searchState = useAppSelector(state => state);
  const {
    settings,
    search: { keyFilter },
  } = searchState;
  const [isLoadingLoadFile, setLoadingLoadFile] = useState<any>(false);
  const { t } = useTranslation();
  const handleVisualSearch = async (blob: Blob) => {
    history.push('/result');
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());
    onChangeLoading(true);
    let payload: any;
    let filters: any[] = [];
    setLoadingLoadFile(true);
    dispatch(setImageSearchInput(URL.createObjectURL(blob)));
    // @ts-ignore
    let image = await createImage(blob);

    dispatch(setRequestImage(image));
    const preFilter = [
      {
        key: settings.visualSearchFilterKey,
        values: [`${keyFilter}`],
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
      filters: keyFilter ? preFilter : undefined,
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
      setLoadingLoadFile(false);
      onChangeLoading(false);
      dispatch(updateStatusLoading(false));
      return dispatch(showFeedback());
    });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[]) => {
      var file = fs[0];
      if (file.type === 'image/heic') {
        heic2any({
          blob: file as Blob,
          toType: 'image/png',
          quality: 1.0,
        })
          .then(function (resultBlob) {
            console.log({ resultBlob });
            handleVisualSearch(resultBlob as Blob);
          })
          .catch(function (error) {
            console.error('Error converting HEIC to PNG:', error);
          });
      } else {
        handleVisualSearch(fs[0]);
      }
    },
  });

  return (
    <Box
      className={
        !isDragActive && !isLoadingLoadFile
          ? `box-content-main`
          : `box-content-main-drop`
      }
    >
      {isLoading && (
        <Box className="loadingSpinCT">
          <Box className="box-content-spin"></Box>
        </Box>
      )}

      <div
        className={`box-border`}
        style={{ position: 'relative' }}
        {...getRootProps({
          onClick: e => {
            e.stopPropagation();
          },
        })}
      >
        {isDragActive ? (
          <Box>
            <Typography className="text-drop-file">
              DRAG <span className="tractor">&</span> DROP
            </Typography>
            <input
              {...getInputProps({
                onClick: e => {
                  e.stopPropagation();
                },
              })}
              type="file"
              name="file"
              id="select_file"
              placeholder="Choose photo"
              accept={acceptTypes}
              onChange={makeFileHandler(e => {})}
            />
          </Box>
        ) : (
          <>
            <Box
              className="box-content-drop"
              {...getRootProps({
                onClick: e => {
                  e.stopPropagation();
                },
              })}
            >
              <Box style={{ marginBottom: 16 }}>
                <img src={IconUpload} alt="" width={48} height={48} />
              </Box>
              <label
                htmlFor="select_file"
                className=""
                style={{ color: '#2B2C46', fontSize: 14 }}
              >
                <span className="fw-700" style={{ paddingRight: '4px' }}>
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
                style={{ display: 'block' }}
              />
            </Box>
          </>
        )}
      </div>
    </Box>
  );
}

export default memo(DragDropFile);
