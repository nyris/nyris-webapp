import {memo, useEffect, useState} from 'react';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import Loading from './Loading';
import { useImageSearch } from 'hooks/useImageSearch';
import useDragAndDrop from 'hooks/useDragAndDrop';
import { useNavigate } from 'react-router';
import { useCadSearch } from 'hooks/useCadSearch';
import { isCadFile } from '@nyris/nyris-api';
import Hint from './Hint';
import { clone } from 'lodash';
import useRequestStore from '../stores/request/requestStore';
import { getFilters } from '../services/filter';

interface Props {
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const { isLoading } = props;
  let navigate = useNavigate();

  const { t } = useTranslation();
  const { singleImageSearch } = useImageSearch();
  const { cadSearch } = useCadSearch();

  const [resultFilter, setResultFilter] = useState<any>([]);

  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setSpecifications = useRequestStore(state => state.setSpecifications);
  const setShowNotification = useRequestStore(state => state.setShowNotification);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setPreFilter = useRequestStore(state => state.setPreFilter);

  const getPreFilters = async () => {
    const dataResultFilter = getFilters(1000, window.settings)
      .then(res => {
        setResultFilter(res);
      })
      .catch((e: any) => {
        console.log('err getDataFilterDesktop', e);
      });
  }

  useEffect(() => {
    getPreFilters()
  }, []);

  const handleUpload = (file: File) => {

    if (isCadFile(file)) {
      cadSearch({
        file: file,
        settings: window.settings,
        newSearch: true,
      }).then(res => {});

      return;
    }

    singleImageSearch({
      image: file,
      settings: window.settings,
      showFeedback: true,
    }).then((singleImageResp) => {
      const specificationPrefilter = singleImageResp.image_analysis?.specification?.prefilter_value || null;
      const hasPrefilter = resultFilter.filter((filter: any) => filter.values.includes(specificationPrefilter));
      if (specificationPrefilter && hasPrefilter.length) {
        setSpecifications(clone(singleImageResp.image_analysis.specification));
        setRequestImages([]);
        setPreFilter({[singleImageResp.image_analysis?.specification?.prefilter_value]: true});
        setAlgoliaFilter(`${window.settings.alogoliaFilterField}:'${singleImageResp.image_analysis?.specification?.prefilter_value}'`);

        navigate('/result');

        setShowNotification(true);
        setTimeout(() => {
          // setShowNotification(false);
        }, 5000);

      } else {
        navigate('/result');
      }
    });
  };

  const { isDragging, dragProps } = useDragAndDrop({
    onDropCallback: handleUpload,
  });

  return (
    <label
      htmlFor="select_file"
      className={
        'flex flex-col items-center justify-center mt-8 bg-[#fafafa] drag-n-drop-label'
      }
    >
      {isLoading && <Loading />}

      <div
        className={'relative flex flex-col items-center justify-center w-full'}
        {...dragProps}
      >
        <div
          className={twMerge([
            'drag-n-drop-inner',
            'flex flex-col items-center w-full cursor-pointer pb-4 pt-4 rounded-[12px]',
            'text-[#cacad1] hover:text-primary',
            'border-2 border-dashed border-transparent hover:border-[#e0e0e0]',
            isDragging && 'text-primary border-[#e0e0e0]',
          ])}
        >
          <div className="" style={{ fontSize: 14 }}>
            <span className="font-bold text-sm pr-1">{t('Drag and drop')}</span>
            {t('an image here')}
          </div>
          <Hint />
          <input
            onChange={e => {
              e.stopPropagation();
              if (e.target.files && e.target.files[0]) {
                handleUpload(e.target.files[0]);
                e.target.value = '';
              }
            }}
            style={{}}
            type="file"
            name="file"
            id="select_file"
            className="absolute z-[-1] opacity-0"
            placeholder="Choose photo"
            accept={'.stp,.step,.stl,.obj,.glb,.gltf,.heic,.heif,.pdf,image/*'}
          />
        </div>
      </div>
    </label>
  );
}

export default memo(DragDropFile);
