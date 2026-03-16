import React, { useEffect, useMemo, useState } from 'react';
import { find } from 'services/visualSearch';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import { twMerge } from 'tailwind-merge';

const MatchNotificationBanner = ({ className }: { className?: string }) => {
  const [goBack, setGoBack] = useState(false);
  const [textSearch, setTextSearch] = useState<
    'loading' | 'resolved' | 'pending'
  >('pending');

  const [prevResult, setPrevResult] = useState<any[]>([]);

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );

  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );

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
    setGoBack(false);
    setTextSearch('pending');
  }, []);

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

  const groundingQuery = useRequestStore(state => state.groundingQuery);
  if (goBack) {
    return <></>;
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
              Didn't find the correct product?
            </p>
          )}
          {textSearch !== 'resolved' && (
            <p className="text-[#4a5568] text-sm md:text-base">
              Are you looking for ?{' '}
              <span className="font-bold">{groundingQuery}</span>
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
            Show all results
          </button>
        )}

        {textSearch !== 'resolved' && (
          <button
            className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
            onClick={() => {
              setTextSearch('loading');
              find({
                settings: window.settings,
                text: groundingQuery,
              }).then(res => {
                useResultStore.getState().setFindApiProducts(res?.results);
                setTextSearch('resolved');
              });
            }}
          >
            Search now
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
        'flex items-center justify-between w-full bg-[#F2FBF3] rounded-[16px] p-2 pl-2 shadow-sm',
        className,
      ])}
    >
      {/* Left Section: Icon and Text */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
        <p className="text-[#4a5568] text-sm md:text-base">
          {showingGroundingFilterResult ? 'Showing' : 'Found'}{' '}
          <span className="font-bold text-slate-900 pr-1">
            {groundingFilterResult?.length}
          </span>
          matching product in results
        </p>
      </div>

      {/* Right Section: Action Button */}
      <button
        className="bg-[#373b53] hover:bg-[#2d3145] text-white px-6 py-3 rounded-lg text-xs font-semibold transition-colors duration-200"
        onClick={() => {
          useResultStore.getState().setShowingGroundingFilterResult();
        }}
      >
        {showingGroundingFilterResult
          ? 'Show all results'
          : 'Show only matching results'}
      </button>
    </div>
  );
};

export default MatchNotificationBanner;
