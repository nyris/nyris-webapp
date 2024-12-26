import { memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import Loading from './Loading';
import { useImageSearch } from 'hooks/useImageSearch';
import useDragAndDrop from 'hooks/useDragAndDrop';
import { useNavigate } from 'react-router';

interface Props {
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const { isLoading } = props;
  const isCadSearch = window.settings.cadSearch;
  let navigate = useNavigate();

  const { t } = useTranslation();
  const { singleImageSearch } = useImageSearch();

  const handleUpload = (files: File[]) => {
    navigate('/result');

    singleImageSearch({
      image: files[0],
      settings: window.settings,
      showFeedback: true,
    }).then(() => {});
  };

  const { isDragging, dragProps } = useDragAndDrop({
    onDropCallback: handleUpload,
  });

  return (
    <label
      htmlFor="select_file"
      className={
        'flex flex-col items-center justify-center h-full mt-8 px-4 pb-6 bg-[#fafafa]'
      }
    >
      {isLoading && <Loading />}

      <div
        className={
          'relative flex flex-col items-center justify-center w-full h-[80%]'
        }
        {...dragProps}
      >
        <div
          className={twMerge([
            'flex flex-col items-center w-full cursor-pointer pb-4 pt-4 rounded-[60px]',
            'text-[#cacad1] hover:text-primary',
            'border-2 border-dashed border-transparent hover:border-[#e0e0e0]',
            isDragging && 'text-primary border-[#e0e0e0]',
          ])}
        >
          <div style={{ marginBottom: 16 }}>
            <Icon name="drop" width={48} height={48} />
          </div>
          <div className="" style={{ fontSize: 14 }}>
            <span className="font-bold text-sm pr-1">{t('Drag and drop')}</span>
            {t('an image here')}
          </div>
          <input
            onChange={e => {
              e.stopPropagation();
              if (e.target.files) {
                handleUpload(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
            style={{}}
            type="file"
            name="file"
            id="select_file"
            className="absolute z-[-1] opacity-0"
            placeholder="Choose photo"
            accept={`${
              isCadSearch ? '.stp,.step,.stl,.obj,.glb,.gltf,' : ''
            }image/*`}
          />
        </div>
      </div>
    </label>
  );
}

export default memo(DragDropFile);
