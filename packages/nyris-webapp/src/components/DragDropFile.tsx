import { memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { updateStatusLoading, loadingActionResults } from 'Store/search/Search';
import { useHistory } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import Loading from './Loading';
import { useImageSearch } from 'hooks/useImageSearch';
import { Icon } from '@nyris/nyris-react-components';
import { isCadFile } from '@nyris/nyris-api';
import { useCadSearch } from 'hooks/useCadSearch';

interface Props {
  acceptTypes: any;
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { isLoading } = props;
  const settings = useAppSelector(state => state.settings);
  const { t } = useTranslation();
  const { cadSearch } = useCadSearch();

  const { singleImageSearch } = useImageSearch();
  const isCadSearch = window.settings.cadSearch;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[], _, e) => {
      e.stopPropagation();
      history.push('/result');

      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      if (isCadFile(fs[0]) && isCadSearch) {
        dispatch(updateStatusLoading(true));
        dispatch(loadingActionResults());
        if (history.location.pathname !== '/result') {
          history.push('/result');
        }
        cadSearch({ file: fs[0], settings, newSearch: true }).then(res => {
          dispatch(updateStatusLoading(false));
        });
      } else {
        singleImageSearch({ image: fs[0], settings, showFeedback: true }).then(
          () => {
            dispatch(updateStatusLoading(false));
          },
        );
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
            <Icon name="drop" width={48} height={48} />
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
            accept={`${
              isCadSearch ? '.stp,.step,.stl,.obj,.glb,.gltf,' : ''
            }image/*`}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(DragDropFile);
