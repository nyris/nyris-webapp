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
import PoweredBy from 'components/PoweredBy';
import CurrentRefinements from 'components/CurrentRefinements';
import { GoBackButton } from 'components/GoBackButton';
import { useCurrentRefinements } from 'react-instantsearch';
import CustomCamera from 'components/CustomCameraDrawer';
import { useTranslation } from 'react-i18next';
import { useImageSearch } from 'hooks/useImageSearch';
import MatchNotificationBanner from 'components/MatchNotificationBanner';
import ImageUpload from 'components/ImageUpload';
import SmartFilter from 'components/SmartFilter';
import { ChatAssistant, MobileChatAssistant } from 'components/ChatAssistant';
import IdentifiedAttributes from 'components/IdentifiedAttributes';

function Results() {
  const settings = window.settings;
  const isSmartFiltersEnabled = !!settings.useSmartFilters;
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
  const setIsFindApiLoading = useUiStore(state => state.setIsFindApiLoading);
  const isAiModeOpen = useUiStore(state => state.isAiModeOpen);

  const requestId = useResultStore(state => state.requestId);
  const imageAnalysis = useResultStore(state => state.imageAnalysis);

  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );
  const requestImages = useRequestStore(state => state.requestImages);
  const specifications = useRequestStore(state => state.specifications);
  const query = useRequestStore(state => state.query);
  const regions = useRequestStore(state => state.regions);

  const [showPostFilter, setShowPostFilter] = useState(false);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  const isShowFilter = query || requestImages[0];

  const { items } = useCurrentRefinements();

  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Search results';
  }, [cadenas?.cadenas3dWebView, cadenas?.cadenasAPIKey]);
  const { singleImageSearch } = useImageSearch();

  const getImageFromUrl = async (
    url: string,
    onDownload: (file: File) => void,
  ) => {
    setIsFindApiLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });
      // URL.createObjectURL(file);

      if (onDownload && response.ok) {
        onDownload(file);
      } else {
        setIsFindApiLoading(false);
      }
    } catch (err) {
      setIsFindApiLoading(false);

      console.error('Failed to fetch image:', err);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrlParam = urlParams.get('imageUrl');
    let imageUrl = null;
    if (imageUrlParam) {
      try {
        imageUrl = atob(imageUrlParam);
      } catch {
        imageUrl = imageUrlParam;
      }
    }
    if (!imageUrl) return;
    getImageFromUrl(imageUrl, file => {
      singleImageSearch({
        image: file,
        settings: window.settings,
        showFeedback: true,
        clearPostFilter: true,
      }).then(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!settings.algolia.enabled) {
      return false;
    }

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
      <div className="h-full overflow-y-auto overflow-x-hidden desktop:overflow-hidden">
        <div
          className={twMerge([
            'flex',
            'flex-col',
            'desktop:flex-row',
            'h-full',
            'desktop:min-h-0',
          ])}
        >
          <SidePanel className="hidden desktop:flex h-full max-h-full min-h-0" />
          {/* Scrollable area: results + sticky chat. Scrollbar lands at far right. */}
          <div className="flex-1 flex flex-col desktop:flex-row desktop:h-full desktop:min-h-0 desktop:overflow-y-auto">
            {/* Result content */}
            <div className="w-full min-h-full flex flex-col desktop:min-h-0 flex-1">
              <div
                className={twMerge([
                  requestImages[0] && 'pt-0',
                  'desktop:pt-0',
                  'desktop:mt-0',
                  'flex',
                  'flex-col',
                  'relative',
                  'w-full',
                  'mr-auto',
                  'ml-auto',
                  'flex-1',
                ])}
              >
                <div className="block desktop:hidden desktop:mb-0 mx-2">
                  {requestImages[0] && <ImagePreview />}
                  {isSmartFiltersEnabled && (
                    <div className="my-4">
                      <SmartFilter
                        imageAnalysis={imageAnalysis}
                        specificationFilter={specificationFilter}
                      />
                    </div>
                  )}
                  {window.settings.showImageDetails &&
                    (imageAnalysis?.imageDescription ||
                      Object.keys(imageAnalysis?.specification || {}).length >
                        0) && (
                      <div className="p-2">
                        <div className="self-stretch p-4 bg-[#e9e9ef] rounded-[32px] flex justify-start flex-col items-start gap-2 flex-wrap content-start w-full">
                          {imageAnalysis?.imageDescription !==
                            'No description available' && (
                            <div className="self-stretch flex flex-col justify-start items-start">
                              <div className="justify-start text-black text-base font-semibold">
                                Image description
                              </div>
                              <div className="self-stretch justify-start text-black text-sm font-normal">
                                {imageAnalysis?.imageDescription || ''}
                              </div>
                            </div>
                          )}

                          {Object.keys(imageAnalysis?.specification || {})
                            .filter(
                              key =>
                                key !== 'is_nameplate' &&
                                key !== 'prefilter_value',
                            )
                            .some(
                              key => !!imageAnalysis?.specification[key],
                            ) && (
                            <div className="justify-start text-[#2b2c46] text-base font-semibold mt-1">
                              Identified Attributes
                            </div>
                          )}
                          <div className="flex justify-start items-start gap-4 flex-wrap content-start">
                            {Object.keys(imageAnalysis?.specification || {})
                              .filter(
                                key =>
                                  key !== 'is_nameplate' &&
                                  key !== 'prefilter_value',
                              )
                              .map(key => {
                                const value = imageAnalysis?.specification[key];
                                if (!value) {
                                  return null;
                                }
                                return (
                                  <IdentifiedAttributes
                                    attr={key}
                                    value={value}
                                    specificationFilter={specificationFilter}
                                    imageAnalysis={imageAnalysis}
                                  />
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <div
                  className={twMerge([
                    requestImages[0] && 'pt-0',
                    'desktop:pt-4',
                    'flex',
                    'flex-col',
                    'relative',
                    'w-full',
                    'mr-auto',
                    'ml-auto',
                    'flex-grow',
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
                    {!specifications?.specificationPrefilter &&
                      specifications?.prefilter_value &&
                      window.settings.algolia.enabled && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            marginLeft: 16,
                            marginBottom: 16,
                          }}
                        >
                          {t('Showing results for machine', {
                            prefilter_title:
                              window.settings.visualSearchFilterKey,
                            prefilter_value: specifications.prefilter_value,
                          })}
                        </div>
                      )}
                    <div
                      className={twMerge([
                        'relative',
                        'flex',
                        'justify-center',
                        'mx-0.5',
                        'mobile-md:mx-2',
                        'desktop:mx-4',
                        'h-full',
                      ])}
                    >
                      <div className="max-w-[840px] w-full relative flex flex-col justify-between mb-20 desktop:mb-0">
                        <div
                          className={twMerge(
                            'grid grid-cols-[repeat(auto-fit,_minmax(180px,_0px))] desktop:grid-cols-[repeat(auto-fit,_minmax(190px,_0px))]',
                            'gap-2 desktop:gap-6 justify-center max-w-[100%] mx-auto',
                            'w-full',
                          )}
                        >
                          <GoBackButton className="col-span-full mb-2 desktop:mb-0 mt-2 desktop:mt-0" />
                          <CurrentRefinements className="col-span-full" />
                          <MatchNotificationBanner className="col-span-full" />
                          <ProductList />
                        </div>

                        {showFeedbackSuccess && (
                          <div className={'feedback-floating'}>
                            <div className="feedback-section">
                              <div className="feedback-success">
                                {t('Thank you for your feedback')}
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
                              productsFromAlgolia.length === 0 &&
                              !isAlgoliaLoading
                                ? 'opacity-0 hidden'
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
                            {!isFindApiLoading &&
                              window.settings.support &&
                              window.settings.support.enabled &&
                              (query || requestImages[0] || specifications) && (
                                <InquiryBanner
                                  requestImage={requestImages[0]}
                                  selectedRegion={regions[0]}
                                  query={query}
                                />
                              )}
                          </div>
                          {settings.showPoweredByNyris && (
                            <PoweredBy
                              className={
                                'flex desktop:w-0 desktop:h-0 w-full justify-center items-center mb-2'
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-[6px] px-6  mb-6">
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
            </div>

            <div
              className={twMerge(
                'hidden desktop:flex flex-col sticky top-0 self-start',
                'overflow-hidden transition-all duration-300',
                'h-screen max-h-full',
                isAiModeOpen
                  ? 'w-[325px] min-w-[325px] max-w-[325px]'
                  : 'w-0 min-w-0 max-w-0',
                'rounded-3xl',

                isAiModeOpen && 'pb-4 pr-4',
                'shadow-ds-2',
              )}
            >
              <ChatAssistant />
            </div>
          </div>
        </div>

        <div className="flex desktop:hidden w-full fixed bottom-4 z-50 px-3 pr-5 gap-2">
          <TextSearch
            className="flex desktop:hidden w-full gap-2"
            onCameraClick={() => setOpenModalCamera(true)}
            showImageUpload={false}
            aiMode={true}
          />

          {isShowFilter && settings.postFilterOption && (
            <div
              style={{
                position: 'relative',
                padding: ' 8px',
                flexShrink: 0,
                borderRadius: '32px',
                background: '#FAFAFA',
              }}
              className={twMerge(
                'h-14 min-w-14 flex items-center justify-center ',
                'border border-solid border-[#DDDEE7]',
                'shadow-ds-2',
              )}
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
                  width: '40px',
                  height: '40px',
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
          <div
            className={twMerge(
              'h-14 min-w-14 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-solid border-[#DDDEE7]',
              'shadow-ds-2',
            )}
          >
            <ImageUpload onCameraClick={() => setOpenModalCamera(true)} />
          </div>
        </div>
        <PostFilterDrawer
          openModal={showPostFilter}
          handleClose={() => setShowPostFilter(false)}
        />
        <CustomCamera
          show={isOpenModalCamera}
          onClose={() => {
            setOpenModalCamera(s => !s);
          }}
          newSearch={true}
        />
        {isAiModeOpen && (
          <div className="desktop:hidden">
            <MobileChatAssistant />
          </div>
        )}
      </div>
    </>
  );
}

export default Results;
