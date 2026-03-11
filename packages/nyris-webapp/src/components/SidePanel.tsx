import { twMerge } from 'tailwind-merge';

import ImagePreview from './ImagePreview';
import useRequestStore from 'stores/request/requestStore';
import PostFilterComponent from './PostFilter/PostFilterComponent';
import useResultStore from 'stores/result/resultStore';
import ItemSpecification from './ItemSpecification';
import useUiStore from 'stores/ui/uiStore';

export default function SidePanel({ className }: { className?: string }) {
  const requestImages = useRequestStore(state => state.requestImages);

  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );

  const showSidePanel = useUiStore(state => state.showSidePanel);

  const imageAnalysis = useResultStore(state => state.imageAnalysis);

  const showPostFilter = window.settings?.postFilterOption;

  if (!showPostFilter && requestImages.length === 0) {
    return <></>;
  }

  return (
    <div
      className={twMerge(
        [
          'max-w-[325px]',
          'w-full',
          'shadow-[3px_-2px_3px_-3px_#d3d4d8]',
          'overflow-x-hidden',
          'overflow-y-auto',
          'bg-white',
          'relative',
          'flex',
          'flex-col',
        ],
        className,
      )}
    >
      <div
        className={twMerge(
          ' w-full h-full overflow-y-auto overflow-x-hidden',
          showSidePanel ? 'block' : 'hidden',
        )}
      >
        <div className="w-full h-full">
          <div
            className={twMerge([
              'w-full',
              'h-fit',
              'min-h-auto',
              'relative',
              'flex',
              'justify-center',
              'items-center',
              'min-w-[283px]',
              // 'mx-4',
              // 'mt-4',
              // 'rounded',
            ])}
          >
            {requestImages[0] && <ImagePreview />}
          </div>
          <div className="p-3">
            {window.settings.showImageDetails &&
              (imageAnalysis?.imageDescription ||
                Object.keys(imageAnalysis?.specification || {}).length > 0) && (
                <div className="self-stretch p-4 bg-[#f3f3f5] rounded inline-flex flex-col justify-start items-start gap-1.5 mt-4 mx-4 ">
                  {imageAnalysis?.imageDescription !==
                    'No description available' && (
                    <div className="self-stretch flex flex-col justify-start items-start">
                      <div className="justify-start text-black text-base font-semibold">
                        Image description
                      </div>
                      <div className="self-stretch justify-start text-black text-xs font-normal">
                        {imageAnalysis?.imageDescription || ''}
                      </div>
                    </div>
                  )}

                  {Object.keys(imageAnalysis?.specification || {})
                    .filter(
                      key =>
                        key !== 'is_nameplate' && key !== 'prefilter_value',
                    )
                    .some(key => !!imageAnalysis?.specification[key]) && (
                    <div className="justify-start text-black text-base font-semibold mt-2">
                      Identified Attributes
                    </div>
                  )}

                  {Object.keys(imageAnalysis?.specification || {})
                    .filter(
                      key =>
                        key !== 'is_nameplate' && key !== 'prefilter_value',
                    )
                    .map(key => {
                      const value = imageAnalysis?.specification[key];
                      if (!value) {
                        return null;
                      }
                      return (
                        <ItemSpecification
                          attr={key}
                          value={value}
                          specificationFilter={specificationFilter}
                          imageAnalysis={imageAnalysis}
                        />
                      );
                    })}
                </div>
              )}
            {showPostFilter && (
              <PostFilterComponent
                className={requestImages.length === 0 ? 'mt-9' : ''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
