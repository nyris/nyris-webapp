import { twMerge } from 'tailwind-merge';

import ImagePreview from './ImagePreview';
import useRequestStore from 'stores/request/requestStore';
import PostFilterComponent from './PostFilter/PostFilterComponent';

export default function SidePanel() {
  const requestImages = useRequestStore(state => state.requestImages);
  const showPostFilter = window.settings?.postFilterOption;

  if (!showPostFilter && requestImages.length === 0) {
    return <></>;
  }
  return (
    <div
      className={twMerge([
        'max-w-[320px]',
        'w-full',
        'shadow-[3px_-2px_3px_-3px_#d3d4d8]',
        'overflow-x-hidden',
        'overflow-y-auto',
        'bg-white',
        'relative',
        'flex',
        'flex-col',
      ])}
    >
      <div
        className={twMerge([
          'w-full',
          'h-fit',
          'min-h-auto',
          'relative',
          'flex',
          'justify-center',
          'items-center',
        ])}
      >
        {requestImages[0] && <ImagePreview />}
      </div>
      {showPostFilter && (
        <PostFilterComponent
          className={requestImages.length === 0 ? 'mt-9' : ''}
        />
      )}
    </div>
  );
}
