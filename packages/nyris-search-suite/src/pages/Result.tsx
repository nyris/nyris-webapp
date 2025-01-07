import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';

import { HitsPerPage } from 'components/HitsPerPage';
import { Pagination } from 'components/Pagination';
import ProductList from 'components/Product/ProductList';
import SidePanel from 'components/SidePanel';
import Loading from 'components/Loading';

import Feedback from 'components/Feedback';
import { feedbackSuccessEpic } from 'services/Feedback';
import useRequestStore from 'stores/request/requestStore';
import RfqBanner from 'components/Rfq/RfqBanner';
import InquiryBanner from 'components/Inquiry/InquiryBanner';
import TextSearch from 'components/TextSearch';
import { Icon } from '@nyris/nyris-react-components';
import PostFilterDrawer from 'components/PostFilter/PostFilterDrawer';
import ImagePreview from 'components/ImagePreview';
import Footer from 'components/Footer';
import CurrentRefinements from 'components/CurrentRefinements';
import { GoBackButton } from 'components/GoBackButton';
import { useCurrentRefinements } from 'react-instantsearch';

function Results() {
  const settings = window.settings;
  const cadenas = settings.cadenas;

  const [feedbackStatus, setFeedbackStatus] = useState<
    'hidden' | 'submitted' | 'visible'
  >();
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );

  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);
  const setShowFeedback = useUiStore(state => state.setShowFeedback);
  const showFeedback = useUiStore(state => state.showFeedback);

  const requestId = useResultStore(state => state.requestId);

  const requestImages = useRequestStore(state => state.requestImages);
  const query = useRequestStore(state => state.query);
  const regions = useRequestStore(state => state.regions);

  const [showPostFilter, setShowPostFilter] = useState(false);

  const isShowFilter = query || requestImages[0];

  const { items } = useCurrentRefinements();

  useEffect(() => {
    document.title = 'Search results';
  }, [cadenas?.cadenas3dWebView, cadenas?.cadenasAPIKey]);

  const submitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);
    setFeedbackStatus('submitted');
    setShowFeedback(false);
    feedbackSuccessEpic(requestId, data);
  };

  useEffect(() => {
    if (isAlgoliaLoading || isFindApiLoading) {
      setFeedbackStatus('hidden');
      return;
    }

    if (!window.settings.showFeedback || !showFeedback) return;

    const handleScroll = () => {
      setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
      setShowFeedback(false);
    };

    setTimeout(() => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
      setShowFeedback(false);
    }, 3000);

    window.addEventListener('scroll', handleScroll, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showFeedback,
    productsFromFindApi,
    productsFromAlgolia,
    isAlgoliaLoading,
    isFindApiLoading,
  ]);

  const disablePostFilter = useMemo(() => {
    return settings.postFilterOption && productsFromAlgolia.length > 0
      ? false
      : true;
  }, [settings, productsFromAlgolia]);

  const isPostFilterApplied = items.length > 0;

  return (
    <>
      {isFindApiLoading && (
        <div className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Loading />
        </div>
      )}
      <div className="h-full">
        <div
          className={twMerge([
            'flex',
            'flex-col',
            'desktop:flex-row',
            'justify-between',
            'relative',
            'h-full',
            'overflow-y-auto',
          ])}
        >
          <SidePanel className="hidden desktop:flex" />

          <div className="block desktop:hidden mb-4 desktop:mb-0">
            {requestImages[0] && <ImagePreview />}
          </div>
          <div
            className={twMerge([
              requestImages[0] ? 'pt-0' : 'pt-3',
              'desktop:pt-10',
              'desktop:overflow-hidden',
              'desktop:overflow-y-auto',
              'flex',
              'flex-col',
              'relative',
              'w-full',
              'mr-auto',
              'ml-auto',
              'h-full',
            ])}
          >
            <div
              className={twMerge([
                'flex',
                'flex-col',
                'flex-grow',
                'desktop:mt-0',
              ])}
            >
              <div
                className={twMerge([
                  'h-full',
                  'relative',
                  'flex',
                  'justify-center',
                  'mx-0.5',
                  'mobile-md:mx-2',
                  'desktop:mx-4',
                ])}
              >
                <div className="max-w-[840px] w-full relative flex flex-col justify-between mb-20 desktop:mb-0">
                  <div
                    className={twMerge(
                      'grid grid-cols-[repeat(auto-fit,_minmax(180px,_0px))] desktop:grid-cols-[repeat(auto-fit,_minmax(190px,_0px))]',
                      'gap-2 desktop:gap-6 justify-center max-w-[100%] mx-auto',
                    )}
                  >
                    <GoBackButton className="col-span-full mb-2 desktop:mb-0" />
                    <CurrentRefinements className="col-span-full" />
                    <ProductList />
                  </div>

                  {showFeedbackSuccess && (
                    <div className={'feedback-floating'}>
                      <div className="feedback-section">
                        <div className="feedback-success">
                          Thanks for your feedback!
                        </div>
                      </div>
                    </div>
                  )}

                  {feedbackStatus === 'visible' &&
                    !showFeedbackSuccess &&
                    productsFromAlgolia.length > 0 && (
                      <div className={'feedback-floating'}>
                        <div className="feedback-section feedback-backdrop-blur" />

                        <div className="feedback-section">
                          <Feedback
                            submitFeedback={submitFeedback}
                            onFeedbackClose={() => {
                              setFeedbackStatus('submitted');
                              setShowFeedback(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  <div>
                    <Pagination
                      isLoading={isFindApiLoading || isAlgoliaLoading}
                      className={
                        productsFromAlgolia.length === 0 && !isAlgoliaLoading
                          ? 'opacity-0'
                          : ''
                      }
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexGrow: 1,
                      }}
                    >
                      {requestImages.length > 0 &&
                        !isAlgoliaLoading &&
                        !isFindApiLoading &&
                        window.settings.rfq &&
                        window.settings.rfq.enabled && (
                          <RfqBanner
                            requestImage={requestImages[0]}
                            selectedRegion={regions[0]}
                          />
                        )}
                      {!isAlgoliaLoading &&
                        !isFindApiLoading &&
                        window.settings.support &&
                        window.settings.support.enabled &&
                        (query || requestImages[0]) && (
                          <InquiryBanner
                            requestImage={requestImages[0]}
                            selectedRegion={regions[0]}
                            query={query}
                          />
                        )}
                    </div>
                    <Footer className="bg-[#fafafa] desktop:hidden" />
                  </div>
                </div>
              </div>
            </div>

            <HitsPerPage
              items={[
                { label: '10', value: 10 },
                { label: '20', value: 20, default: true },
                { label: '30', value: 30 },
                { label: '40', value: 40 },
                { label: '50', value: 50 },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex desktop:hidden w-full fixed bottom-4 z-50 px-3 gap-2">
        <TextSearch className="flex desktop:hidden w-full gap-2" />
        {isShowFilter && settings.postFilterOption && (
          <div
            style={{
              position: 'relative',
              width: '48px',
              height: '48px',
              padding: ' 8px',
              flexShrink: 0,
              borderRadius: '32px',
              background: '#FAFAFA',
              boxShadow: ' 0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => {
              if (disablePostFilter && !isPostFilterApplied) return;
              setShowPostFilter(true);

              // setPreFilterDropdown(false);
            }}
          >
            <div
              style={{
                display: 'flex',
                background: `${
                  disablePostFilter
                    ? '#F3F3F5'
                    : isPostFilterApplied
                    ? '#F0EFFF'
                    : '#F3F3F5'
                }`,
                borderRadius: '40px',
                width: '32px',
                height: '32px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon
                name="filter"
                className={twMerge([
                  isPostFilterApplied
                    ? 'text-[#3E36DC]'
                    : disablePostFilter
                    ? 'text-[#E0E0E0]'
                    : 'text-[#2B2C46]',
                ])}
              />
            </div>

            {isPostFilterApplied && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '35px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'white',
                  width: '10px',
                  height: '10px',
                  borderRadius: '100%',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '100%',
                  }}
                  className={twMerge([
                    isPostFilterApplied
                      ? 'bg-[#3E36DC]'
                      : disablePostFilter
                      ? 'bg-[#E0E0E0]'
                      : 'bg-[#2B2C46]',
                  ])}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
      <PostFilterDrawer
        openModal={showPostFilter}
        handleClose={() => setShowPostFilter(false)}
      />
    </>
  );
}

export default Results;
