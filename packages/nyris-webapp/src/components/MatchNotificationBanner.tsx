import { useEffectiveGroundingResults } from 'hooks/useEffectiveGroundingResults';
import { useGroundedSearch } from 'hooks/useGroundedSearch';
import React, { useEffect, useMemo } from 'react';
import { find } from 'services/visualSearch';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import { twMerge } from 'tailwind-merge';

const MatchNotificationBanner = ({ className }: { className?: string }) => {
  const goBack = useUiStore(state => state.bannerGoBack);
  const setGoBack = useUiStore(state => state.setBannerGoBack);
  const textSearch = useUiStore(state => state.bannerTextSearch);
  const setTextSearch = useUiStore(state => state.setBannerTextSearch);

  const [prevResult, setPrevResult] = React.useState<any[]>([]);

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const groundingError = useResultStore(state => state.groundingError);

  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );

  const { groundedSearch } = useGroundedSearch();

  const showBanner = useMemo(() => {
    if (groundingFilterResult.length !== productsFromFindApi.length) {
      return true;
    }

    // Compare the order of SKUs (or fallback to id)
    const getSku = (item: any) => item?.sku ?? '';
    for (let i = 0; i < productsFromFindApi.length; i++) {
      if (getSku(productsFromFindApi[i]) !== getSku(groundingFilterResult[i])) {
        return true;
      }
    }
    // If all SKUs match in order
    return false;
  }, [groundingFilterResult, productsFromFindApi]);

  useEffect(() => {
    if (textSearch === 'pending') {
      setPrevResult(productsFromFindApi || []);
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsFromFindApi]);

  const showingGroundingFilterResult = useResultStore(
    state => state.showingGroundingFilterResult,
  );

  const effectiveGroundingResults = useEffectiveGroundingResults();

  const groundingQuery = useRequestStore(state => state.groundingQuery);
  if (goBack) {
    return <></>;
  }

  if (groundingError) {
    return (
      <div
        className={twMerge([
          'flex items-center justify-between w-full bg-[#FFF8FB] rounded-[16px] p-2 pl-2 shadow-sm',
          className,
        ])}
      >
        {/* Left Section: Icon and Text */}
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[#E31B5D]" />
          <p className="text-[#4a5568] text-sm md:text-base">
            No results from web search.
          </p>
        </div>

        {/* Right Section: Action Button */}
        <button
          className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
          onClick={() => {
            const requestImages = useRequestStore.getState().requestImages;
            const requestImage = requestImages?.[0];
            const findApiProducts =
              useResultStore.getState().productsFromFindApi;
            groundedSearch(requestImage, findApiProducts || []);
          }}
        >
          Search again
        </button>
      </div>
    );
  }

  if (
    (!groundingFilterResult || groundingFilterResult?.length === 0) &&
    !groundingQuery
  ) {
    return <></>;
  }

  if (groundingQuery && groundingFilterResult?.length === 0) {
    return (
      <div
        className={twMerge([
          'flex items-center justify-between w-full bg-[#F2FBF3] rounded-[16px] p-2 pl-2 shadow-sm',
          'h-[56px]',
          className,
        ])}
      >
        {/* Left Section: Icon and Text */}
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
          {textSearch === 'resolved' && (
            <p className="text-[#4a5568] text-sm md:text-base">
              Didn't find what you're looking for?
            </p>
          )}
          {textSearch !== 'resolved' && (
            <p className="text-[#4a5568] text-sm md:text-base">
              Are you looking for
              <span className="font-bold px-0.5">{groundingQuery}</span> ?
            </p>
          )}
        </div>

        {/* Right Section: Action Button */}
        {textSearch === 'resolved' && (
          <button
            className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
            onClick={() => {
              setGoBack(true);
              useResultStore.getState().setFindApiProducts(prevResult);
            }}
          >
            Show original results
          </button>
        )}

        {textSearch !== 'resolved' && (
          <button
            className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
            onClick={() => {
              setTextSearch('loading');
              useUiStore.getState().setIsFindApiLoading(true);

              find({
                settings: window.settings,
                text: groundingQuery,
              })
                .then(res => {
                  useResultStore.getState().setFindApiProducts(res?.results);
                  setTextSearch('resolved');
                })
                .finally(() => {
                  useUiStore.getState().setIsFindApiLoading(false);
                });
            }}
          >
            Search catalog
          </button>
        )}
      </div>
    );
  }

  if (!showBanner) {
    return <></>;
  }

  return (
    <div
      className={twMerge([
        'flex items-center justify-between w-full bg-[#F2FBF3] rounded-[16px] p-2 pl-2 shadow-sm min-h-[56px]',
        className,
      ])}
    >
      {/* Left Section: Icon and Text */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
        <p className="text-[#4a5568] text-sm md:text-base">
          {effectiveGroundingResults.length === 0 && (
            <span>Matched 0 results from Internet search</span>
          )}
          {effectiveGroundingResults.length > 0 && (
            <>
              {showingGroundingFilterResult ? 'Showing' : 'Found'}{' '}
              <span className="font-bold text-slate-900 pr-0.5">
                {effectiveGroundingResults.length}
              </span>
              {showingGroundingFilterResult
                ? 'result from Internet search'
                : ' matching result from Internet search'}
            </>
          )}
        </p>
      </div>

      {/* Right Section: Action Button */}
      {effectiveGroundingResults.length > 0 && (
        <button
          className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
          onClick={() => {
            useResultStore.getState().setShowingGroundingFilterResult();
          }}
        >
          {showingGroundingFilterResult
            ? 'Show original results'
            : 'Show matched results'}
        </button>
      )}
    </div>
  );
};

export default MatchNotificationBanner;
