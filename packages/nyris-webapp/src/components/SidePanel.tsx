import { twMerge } from 'tailwind-merge';

import ImagePreview from './ImagePreview';
import useRequestStore from 'stores/request/requestStore';
import PostFilterComponent from './PostFilter/PostFilterComponent';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import GroundingSpecs from './GroundingSpecs';
import SmartFilter from './SmartFilter';

export default function SidePanel({ className }: { className?: string }) {
  const requestImages = useRequestStore(state => state.requestImages);

  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );

  const findApiProducts = useResultStore(state => state.productsFromFindApi);

  const showSidePanel = useUiStore(state => state.showSidePanel);

  const imageAnalysis = useResultStore(state => state.imageAnalysis);
  const smartFilters = useResultStore(state => state.smartFilters);

  const showPostFilter = window.settings?.postFilterOption;

  const showingGroundingFilterResult = useResultStore(
    state => state.showingGroundingFilterResult,
  );

  const isGoogleGroundingLoading = useUiStore(
    state => state.isGoogleGroundingLoading,
  );
  const googleGroundingResponse = useResultStore(
    state => state.googleGroundingResponse,
  );
  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );
  const groundingProduct =
    googleGroundingResponse?.identified_product ||
    googleGroundingResponse ||
    null;

  if (!showPostFilter && requestImages.length === 0) {
    return <></>;
  }

  if (
    requestImages.length === 0 &&
    findApiProducts.length === 0 &&
    !window.settings.algolia.enabled
  ) {
    return <></>;
  }

  return (
    <div
      className={twMerge(
        [
          'w-full',
          'overflow-hidden',
          'bg-white',
          'relative',
          'flex',
          'flex-col',
          'ml-4',
          'mb-4',
          showSidePanel && 'border border-solid border-[#DDDEE7]',
          showSidePanel ? 'rounded-[32px]' : 'rounded-2xl',
          'transition-all',
          showSidePanel ? 'w-[334px] min-w-[334px]' : 'w-0 min-w-0',
          'shadow-ds-1',
        ],
        className,
      )}
    >
      <div
        className={twMerge(
          ' w-full overflow-y-auto overflow-x-hidden',
          showSidePanel ? 'block' : 'hidden',
        )}
      >
        <div className="w-full">
          <div
            className={twMerge([
              'w-full',
              'h-fit',
              'min-h-auto',
              'relative',
              'flex',
              'justify-center',
              'items-center',
              'w-[295px]',
              'm-4',
              // 'mx-4',
              // 'mt-4',
              // 'rounded',
            ])}
          >
            {requestImages[0] && <ImagePreview />}
          </div>
          <div className="pb-4 flex flex-col gap-6">
            {window.settings.showImageDetails &&
              (imageAnalysis?.imageDescription ||
                Object.keys(imageAnalysis?.specification || {}).length > 0 ||
                smartFilters.status !== 'idle') && (
                <SmartFilter
                  imageAnalysis={imageAnalysis}
                  specificationFilter={specificationFilter}
                />
              )}

            {(isGoogleGroundingLoading || googleGroundingResponse) && (
              <div className="mx-4 rounded-3xl bg-[#F3F4F8] border border-[#e4e3ff] p-3.5 text-[#3B3E5F] ">
                <div className="flex items-center justify-between">
                  {!isGoogleGroundingLoading && (
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <span className="text-[#3B3E5F] font-bold text-sm leading-4">
                        Smart Product Search
                      </span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M7.92274 17.0815C8.14851 17.0509 9.50523 17.0531 9.68837 17.1069C10.0943 17.2269 10.0579 17.8935 9.66298 17.977C9.51665 18.0079 7.97566 18.0068 7.8202 17.977C7.37018 17.8902 7.31801 17.1641 7.92274 17.0815ZM6.43739 15.5718C6.93914 15.4849 10.5164 15.4852 11.0194 15.5718C11.5127 15.6567 11.5125 16.3802 11.0194 16.4673C10.5501 16.55 6.90241 16.5509 6.43739 16.4673C5.94907 16.3791 5.93794 15.6585 6.43739 15.5718ZM11.5575 14.1128C12.0542 14.2692 12.0136 14.9036 11.5057 15.0083H5.95106C5.44374 14.9029 5.40011 14.2659 5.90028 14.1128H11.5575ZM8.3827 0.00828993C14.342 -0.281826 17.6069 7.14091 13.0927 11.2456C12.8954 11.4249 12.3055 11.7912 12.2099 11.9751C11.9627 12.4507 12.3894 13.3278 11.6854 13.5493H5.77235C5.07649 13.3197 5.49332 12.4477 5.24794 11.9751C5.17094 11.827 4.07408 10.991 3.81434 10.6948C0.284508 6.66896 3.12542 0.264519 8.3827 0.00828993ZM8.40907 0.878407C4.05152 1.10169 1.53289 6.2906 4.22352 9.8247C4.76536 10.5363 6.01331 11.1906 6.16884 11.9751C6.19322 12.0982 6.1777 12.6441 6.25868 12.6792H11.1991C11.2727 12.6437 11.2775 12.0209 11.3143 11.8725C11.4808 11.2037 12.6134 10.5761 13.1054 9.97802C16.1901 6.22819 13.1583 0.635396 8.40907 0.878407ZM7.58973 5.5122C7.98646 5.46307 8.45858 5.63311 8.72841 5.93407C9.03408 6.2751 9.04196 6.64401 9.0995 7.07274C10.3076 7.27893 9.28147 6.27654 9.94423 6.04931C10.706 5.78845 10.8635 7.24438 10.2001 7.73876C9.82323 8.01942 9.48381 7.89542 9.06141 7.98192V12.0259C8.87496 12.4562 8.31043 12.4151 8.1913 11.9751V7.98192C7.81441 7.90152 7.50855 7.99688 7.15419 7.78954C6.23495 7.25134 6.49448 5.648 7.58973 5.5122ZM7.69227 6.38231C7.46368 6.42187 7.42105 6.76141 7.49989 6.93212C7.58326 7.11216 7.99291 7.06945 8.15223 7.07274C8.30758 6.75232 8.0614 6.3187 7.69227 6.38231ZM8.69032 1.72313C9.11035 1.61732 10.1708 1.90654 10.5839 2.08153C12.1761 2.75648 13.4423 4.46569 13.5155 6.21532C13.5407 6.81775 13.4838 7.13782 12.7597 6.99657C12.3736 6.92088 12.5135 6.31131 12.4657 6.01122C12.2302 4.53827 11.0312 3.15282 9.56044 2.82372C9.29861 2.76515 8.63971 2.79266 8.52333 2.58056C8.42292 2.39652 8.42838 1.78927 8.69032 1.72313ZM8.99794 3.61766C10.0217 3.49673 11.4103 4.65574 11.5956 5.65282C11.7437 6.4509 10.9592 6.46744 10.7763 6.062C10.5385 5.53507 10.6087 5.21626 10.0214 4.82079C9.55464 4.50653 9.25994 4.6364 8.87001 4.48778C8.51994 4.35422 8.58644 3.6664 8.99794 3.61766Z"
                          fill="#3B3E5F"
                        />
                      </svg>
                    </div>
                  )}

                  {isGoogleGroundingLoading && (
                    <div className="flex items-center gap-2 text-xs text-[#3E36DC]">
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="h-3 w-3 animate-spin"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#3E36DC"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="#3E36DC"
                            d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
                          />
                        </svg>
                        Searching the Internet
                        <span className="inline-flex w-5 justify-start">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse delay-150">.</span>
                          <span className="animate-pulse delay-300">.</span>
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                {isGoogleGroundingLoading && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-[#e4e3ff]">
                    <div className="h-full w-1/2 animate-pulse rounded bg-[#3E36DC]" />
                  </div>
                )}

                {googleGroundingResponse && (
                  <>
                    <div className="mt-4 flex gap-2 items-center">
                      <div className="w-[8px] h-[8px] bg-green-500 rounded-full "></div>

                      <div className="text-sm font-semibold leading-4">
                        1. Results from the internet
                      </div>
                    </div>
                    <div className="mt-3 text-[10px]">
                      <GroundingSpecs data={groundingProduct} />
                    </div>
                  </>
                )}
                {groundingFilterResult?.length > 0 &&
                  showingGroundingFilterResult && (
                    <div className="mt-3.5 text-[#3B3E5F]">
                      <div className="flex gap-2 items-center">
                        <div className="w-[8px] h-[8px] bg-green-500 rounded-full "></div>

                        <div className="text-sm font-semibold leading-4">
                          2. Matched products in visual results
                        </div>
                      </div>
                      <div className="text-xs text-[#22C55E] mb-1 mt-1">
                        Found{' '}
                        <span className="font-bold leading-4">
                          {groundingFilterResult?.length} matching{' '}
                        </span>{' '}
                        product
                      </div>
                      <div className="flex flex-col gap-2">
                        {groundingFilterResult?.map(
                          (item: any, index: number) => (
                            <div
                              key={`${item?.sku || 'sku'}-${index}`}
                              className=""
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-semibold leading-4">
                                  SKU {item?.sku || 'N/A'} :
                                  <span className="text-[10px] mt-1 font-normal leading-4">
                                    {item?.reason || 'No reason provided.'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
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
