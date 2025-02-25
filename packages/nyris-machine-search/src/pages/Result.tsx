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
import CustomCamera from 'components/CustomCameraDrawer';
import { useTranslation } from 'react-i18next';
import Machine from 'components/Machine/components/Machine';
import useMachineStore from 'stores/machine/machineStore';
import { RadioGroup, RadioGroupItem } from 'components/RadioGroup';

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
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);

  const visualSearchSkus = useRequestStore(state => state.visualSearchSkus);

  const setSelectedPartsName = useMachineStore(
    state => state.setSelectedPartsName,
  );
  const setReverseSelectedProduct = useMachineStore(
    state => state.setReverseSelectedProduct,
  );
  const setMachineName = useMachineStore(state => state.setMachineName);

  const selectedPartsName = useMachineStore(state => state.selectedPartsName);
  const autoFocus = useMachineStore(state => state.autoFocus);
  const reverseSelectedProduct = useMachineStore(
    state => state.reverseSelectedProduct,
  );

  const setMachineView = useMachineStore(state => state.setMachineView);
  const setPartsView = useMachineStore(state => state.setPartsView);
  const partsView = useMachineStore(state => state.partsView);

  const [showPostFilter, setShowPostFilter] = useState(false);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  const isShowFilter = query || requestImages[0];

  const { items } = useCurrentRefinements();

  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Search results';
    setMachineName('Festool');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const resetFilter = () => {
    if (visualSearchSkus.length === 0) {
      setAlgoliaFilter('');

      return;
    }

    const filteredSkus = visualSearchSkus.filter(sku =>
      visualSearchSkus.includes(sku),
    );
    const filterSkus: any = filteredSkus
      .reverse()
      .map((sku: any, i: number) => `sku:'${sku}'<score=${i}> `);

    const filterSkusString = [...filterSkus].join('OR ');
    setAlgoliaFilter(filterSkusString);
  };

  const machine = useMemo(() => {
    return <Machine />;
  }, []);

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
          {!settings.machineSearch && (
            <SidePanel className="hidden desktop:flex" />
          )}

          {settings.machineSearch && (
            <div className="overflow-hidden w-1/2 relative">
              {machine}

              {
                <div className="absolute bottom-2 right-4 flex gap-4">
                  {(selectedPartsName.length > 0 ||
                    reverseSelectedProduct ||
                    partsView !== 'none') && (
                    <div
                      className="px-2 py-1.5"
                      onClick={() => {
                        resetFilter();

                        setMachineView('x-ray');
                        setPartsView('none');
                        setSelectedPartsName([]);
                        setReverseSelectedProduct(undefined);
                      }}
                      style={{
                        display: 'flex',
                        border: '1px solid #F1D0DB',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '32px',
                        boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
                        backgroundColor: '#FFE5EF',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: 12 }}>Clear selection</p>
                      <Icon name="close" width={10} height={10} />
                    </div>
                  )}
                </div>
              }
              <div className="absolute bottom-3 left-4">
                {(selectedPartsName.length > 0 ||
                  reverseSelectedProduct ||
                  partsView !== 'none') && (
                  <div className="flex gap-4">
                    <RadioGroup
                      defaultValue="x-ray"
                      className="flex gap-x-4"
                      onValueChange={e => {
                        setMachineView(e as any);
                      }}
                    >
                      <div className="flex items-center space-x-2 h-8 p-2 bg-[#f3f3f5] rounded-2xl">
                        <RadioGroupItem value="solo" id="solo" />
                        <label
                          className="cursor-pointer text-sm"
                          htmlFor="solo"
                        >
                          Solo
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 h-8 p-2 bg-[#f3f3f5] rounded-2xl">
                        <RadioGroupItem value="x-ray" id="x-ray" />
                        <label
                          className="cursor-pointer text-sm"
                          htmlFor="x-ray"
                        >
                          X-ray
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <div
                    className="px-2 py-1.5"
                    onClick={() => {
                      // useVEOnlyStore.setState((state: any) => {
                      //   return { showOnlyV: !state.showOnlyV, showOnlyE: false };
                      // });
                      // onPartsFilter(showOnlyV ? '' : 'wear');
                      setReverseSelectedProduct(undefined);
                      setPartsView(partsView !== 'wear' ? 'wear' : 'none');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '32px',
                      backgroundColor:
                        partsView === 'wear' ? '#2B2C46' : 'white',
                      boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon
                      name="wear"
                      width={14}
                      height={14}
                      color={partsView === 'wear' ? 'white' : '#2B2C46'}
                    />
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: partsView === 'wear' ? 'white' : '#2B2C46',
                      }}
                    >
                      Wear parts
                    </p>
                  </div>
                  <div
                    className="px-2 py-1.5"
                    onClick={() => {
                      // useVEOnlyStore.setState((state: any) => {
                      //   return { showOnlyE: !state.showOnlyE, showOnlyV: false };
                      // });
                      // onPartsFilter(showOnlyE ? '' : 'spare');
                      setReverseSelectedProduct(undefined);
                      setPartsView(partsView !== 'spare' ? 'spare' : 'none');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '32px',
                      backgroundColor:
                        partsView === 'spare' ? '#2B2C46' : 'white',
                      boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon
                      name="spare"
                      width={14}
                      height={14}
                      color={partsView === 'spare' ? 'white' : '#2B2C46'}
                    />
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: partsView === 'spare' ? 'white' : '#2B2C46',
                      }}
                    >
                      Spare parts
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      autoFocus();
                    }}
                    className="px-2 py-1.5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '32px',
                      boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="auto_focus" width={14} height={14} />
                    <p style={{ fontSize: '10px', fontWeight: 600 }}>
                      Auto focus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              'w-1/2',
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
        <TextSearch
          className="flex desktop:hidden w-full gap-2"
          onCameraClick={() => setOpenModalCamera(true)}
        />
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
      <CustomCamera
        show={isOpenModalCamera}
        onClose={() => {
          setOpenModalCamera(s => !s);
        }}
      />
    </>
  );
}

export default Results;
