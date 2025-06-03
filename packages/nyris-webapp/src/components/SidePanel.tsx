import { twMerge } from 'tailwind-merge';

import ImagePreview from './ImagePreview';
import useRequestStore from 'stores/request/requestStore';
import PostFilterComponent from './PostFilter/PostFilterComponent';
import useResultStore from 'stores/result/resultStore';
import { Icon } from '@nyris/nyris-react-components';
import Tooltip from './Tooltip/TooltipComponent';
import { filterProducts } from 'utils/specificationFilter';
import { useEffect } from 'react';

export default function SidePanel({ className }: { className?: string }) {
  const requestImages = useRequestStore(state => state.requestImages);
  const setSpecificationFilteredProducts = useResultStore(
    state => state.setSpecificationFilteredProducts,
  );

  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );

  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );

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
        className={twMerge([
          // 'w-full',
          'h-fit',
          'min-h-auto',
          'relative',
          'flex',
          'justify-center',
          'items-center',
          'min-w-[283px]',
          'mx-4',
          'mt-4',
          'rounded',
        ])}
      >
        {requestImages[0] && <ImagePreview />}
      </div>

      {(imageAnalysis?.imageDescription ||
        Object.keys(imageAnalysis?.specification || {}).length > 0) && (
        <div className="self-stretch p-4 bg-[#f3f3f5] rounded inline-flex flex-col justify-start items-start gap-1.5 mt-4 mx-4 ">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="justify-start text-black text-base font-semibold">
              Image description
            </div>
            <div className="self-stretch justify-start text-black text-xs font-normal">
              {imageAnalysis?.imageDescription || ''}
            </div>
          </div>
          <div className="justify-start text-black text-base font-semibold mt-2">
            Identified Attributes
          </div>

          {Object.keys(imageAnalysis?.specification || {}).map(key => {
            const value = imageAnalysis?.specification[key];
            if (!value) {
              return null;
            }
            return (
              <div
                key={key}
                className="flex justify-between w-full gap-2 items-center"
              >
                <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                  <div className="justify-start text-black text-xs font-semibold">
                    {key}:
                  </div>
                  <Tooltip
                    content={
                      specificationFilter[key]
                        ? 'Filter applied. Clear to choose a different value.'
                        : 'Click to apply as a search filter.'
                    }
                    delayDuration={1000}
                    disabled={!value}
                  >
                    <div
                      className={twMerge(
                        `px-1 py-1 bg-[#e4e3ff] rounded-[1px] flex justify-center items-center gap-1.5`,
                        'border border-solid border-transparent hover:border-[#3E36DC]',
                        'cursor-pointer',
                        specificationFilter[key]
                          ? 'border-[#3E36DC] bg-[#3E36DC] '
                          : '',
                      )}
                      onClick={() => {
                        if (!value) {
                          return;
                        }
                        const setSpecificationFilter =
                          useRequestStore.getState().setSpecificationFilter;

                        const setSpecificationFilteredProducts =
                          useResultStore.getState()
                            .setSpecificationFilteredProducts;

                        if (specificationFilter[key]) {
                          setSpecificationFilter({});
                          setSpecificationFilteredProducts([]);
                          // setProducts(results);
                        } else {
                          setSpecificationFilter({
                            [key]: value,
                          });
                        }
                      }}
                    >
                      <div
                        className={twMerge(
                          'justify-start text-[#3e36dc] text-[10px] leading-none px-0.5',
                          'font-normal hover:font-bold hover:px-0',
                          specificationFilter[key]
                            ? 'font-bold text-white hover:px-0.5'
                            : '',
                          'max-line-1',
                        )}
                      >
                        {imageAnalysis?.specification[key] || 'N/A'}
                      </div>
                    </div>
                  </Tooltip>
                </div>
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(
                      imageAnalysis?.specification[key] || '',
                    );
                  }}
                >
                  <Icon
                    name="copy"
                    className="text-[#AAABB5] w-[12px] h-[12px] hover:text-[#3E36DC] cursor-pointer"
                  />
                </div>
              </div>
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
  );
}
