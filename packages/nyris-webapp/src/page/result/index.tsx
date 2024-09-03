import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { RectCoords } from '@nyris/nyris-api';
import { CurrentRefinements } from 'components/current-refinements/current-refinements';
import FooterResult from 'components/FooterResult';
import CustomSearchBox from 'components/input/inputSearch';
import ProductList from 'components/ProductList';
import { debounce, isEmpty, isUndefined } from 'lodash';
import {
  Configure,
  connectStateResults,
  HitsPerPage,
  Pagination,
} from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { feedbackRegionEpic, feedbackSuccessEpic } from 'services/Feedback';
import { find } from 'services/image';
import {
  loadingActionResults,
  onToggleModalItemDetail,
  selectionChanged,
  setShowFeedback,
  updateResultChangePosition,
  updateStatusLoading,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { showHits } from '../../constants';
import { DEFAULT_REGION } from '../../constants';
import { useTranslation } from 'react-i18next';
import RfqModal from 'components/rfq/RfqModal';
import SidePanel from 'components/SidePanel';
import useFilteredRegions from 'hooks/useFilteredRegions';
import ImagePreview from 'components/ImagePreview';
import RfqBanner from 'components/rfq/RfqBanner';
import InquiryBanner from 'components/Inquiry/InquiryBanner';
import { useQuery } from 'hooks/useQuery';
import { ReactComponent as PoweredByNyrisImage } from 'common/assets/images/powered_by_nyris.svg';
import Feedback from 'components/Feedback';
import { SelectedPostFilter } from 'components/SelectedPostFilter';
import { GoBack } from '../../components/GoBackButton';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'Store/requestStore';

interface Props {
  allSearchResults: any;
  isSearchStalled?: boolean;
}

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const refBoxResult: any = useRef(null);
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;
  const { allSearchResults } = props;
  const {
    requestImage,
    regions,
    selectedRegion,
    preFilter,
    loadingSearchAlgolia,
    results,
    showFeedback,
    firstSearchResults,
    firstSearchImage,
    fetchingResults,
  } = search;

  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [imageSelection, setImageSelection] = useState<any>(null);
  const executeScroll = () => refBoxResult.current.scrollIntoView('-100px');
  const [filterString, setFilterString] = useState<string>();
  const { t } = useTranslation();
  const [showAdjustInfo] = useState(false);
  const [showAdjustInfoBasedOnConfidence, setShowAdjustInfoBasedOnConfidence] =
    useState(false);
  const [rfqStatus, setRfqStatus] = useState<'inactive' | 'loading' | 'sent'>(
    'inactive',
  );
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  // const imageUploadRef = useRef(null);
  const rfqRef = useRef<any>(null);

  const [feedbackStatus, setFeedbackStatus] = useState<
    'hidden' | 'submitted' | 'visible'
  >();
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const query = useQuery();
  const searchQuery = query.get('query') || search.valueTextSearch.query;
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const isPostFilterEnabled = settings.postFilterOption;
  const history = useHistory();

  const { singleImageSearch, multiImageSearch } = useImageSearch();

  const { updateRegion, resetRegions, imageRegions, requestImages } =
    useRequestStore(state => ({
      requestImages: state.requestImages,
      updateRegion: state.updateRegion,
      resetRegions: state.resetRegions,
      imageRegions: state.regions,
    }));

  // useEffect(() => {
  //   if (
  //     !loadingSearchAlgolia &&
  //     (imageThumbSearchInput.includes('blob:') ||
  //       imageThumbSearchInput.includes('data:')) &&
  //     imageUploadRef.current !== imageThumbSearchInput
  //   ) {
  //     setAdjustInfo(true);
  //     const timeout = setTimeout(() => {
  //       setAdjustInfo(false);
  //     }, 2000);
  //     imageUploadRef.current = imageThumbSearchInput;
  //     return () => {
  //       clearTimeout(timeout);
  //       setAdjustInfo(false);
  //     };
  //   }
  // }, [imageThumbSearchInput, loadingSearchAlgolia]);

  useEffect(() => {
    if (loadingSearchAlgolia) {
      setFeedbackStatus('hidden');
      setShowFeedbackSuccess(false);
    }
  }, [loadingSearchAlgolia]);

  useEffect(() => {
    if (selectedRegion) {
      setImageSelection(selectedRegion);
      setRfqStatus('inactive');
      setFeedbackStatus('hidden');
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (requestImage) {
      setFeedbackStatus('hidden');
      executeScroll();
      setImageSelection(DEFAULT_REGION);
      resetRegions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestImage]);

  const findImageByApiNyris = useCallback(
    async (canvas: any, r?: RectCoords) => {
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter),
        },
      ];
      dispatch(loadingActionResults());

      return find({
        image: canvas,
        settings,
        region: r,
        filters: !isEmpty(preFilter) ? preFilterValues : undefined,
      })
        .then((res: any) => {
          dispatch(updateStatusLoading(false));
          return {
            ...res,
          };
        })
        .catch((e: any) => {
          dispatch(updateStatusLoading(false));
          console.log('error call api change selection find image', e);
        });
    },
    [settings, dispatch, preFilter],
  );

  // TODO: Search offers for image:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findItemsInSelection = useCallback(
    debounce(async (r: RectCoords, image: HTMLCanvasElement) => {
      dispatch(updateStatusLoading(true));
      singleImageSearch({ image: image, settings, imageRegion: r }).then(
        (res: any) => {
          dispatch(updateStatusLoading(false));

          dispatch(updateResultChangePosition(res));
          const highConfidence = res.results.find(
            (data: { score: number }) => data.score >= 0.65,
          );
          if (!highConfidence) {
            setShowAdjustInfoBasedOnConfidence(true);
          }
          setTimeout(() => {
            setShowAdjustInfoBasedOnConfidence(false);
          }, 2000);
        },
      );
      return;
    }, 250),
    [requestImage, findImageByApiNyris],
  );

  // TODO: Handler like dislike
  const sendFeedBackAction = async (type: string) => {
    feedbackSuccessEpic(stateGlobal, type === 'like');
  };

  // TODO: Search image with url or file
  const getUrlToCanvasFile = async (url: string) => {
    dispatch(updateStatusLoading(true));
    if (isMobile) {
      executeScroll();
      // setOpenModalImage(false);
      dispatch(onToggleModalItemDetail(false));
    }
    dispatch(loadingActionResults());

    singleImageSearch({ image: url, settings, showFeedback: false }).then(
      () => {
        dispatch(updateStatusLoading(false));
      },
    );
  };
  const nonEmptyFilter: any[] = !requestImage
    ? []
    : ['sku:DOES_NOT_EXIST<score=1> '];
  const filterSkus: any = search?.results
    ? search?.results
        .slice()
        .reverse()
        .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
    : '';
  const filterSkusString = [...nonEmptyFilter, ...filterSkus].join('OR ');

  useEffect(() => {
    document.title = 'Search results';
    setFeedbackStatus('hidden');

    if (requestImage || isEmpty(searchQuery)) return;
    const preFilterValues = Object.keys(preFilter) as string[];
    const filter =
      preFilterValues.length > 0
        ? preFilterValues
            .map(item => `${settings.alogoliaFilterField}:'${item}'`)
            .join(' OR ')
        : '';

    setFilterString(filter);
  }, [preFilter, requestImage, searchQuery, settings.alogoliaFilterField]);

  useEffect(() => {
    if (!requestImage || !isAlgoliaEnabled) {
      return;
    }
    dispatch(updateStatusLoading(true));
    const { canvas }: any = requestImage;
    findImageByApiNyris(canvas).then((res: any) => {
      // setPreFilter(keyFilter);
      dispatch(updateResultChangePosition(res));
    });

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preFilter]);

  useEffect(() => {
    if (!requestImage) return;

    const preFilterValues = Object.keys(preFilter) as string[];
    const preFilterString =
      preFilterValues.length > 0
        ? preFilterValues
            .map(item => `${settings.alogoliaFilterField}:'${item}'`)
            .join(' OR ')
        : '';

    const filter =
      preFilterValues.length > 0
        ? filterSkusString
          ? `(${filterSkusString}) AND ${preFilterString}`
          : preFilterString
        : filterSkusString;
    setFilterString(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSkusString, settings.alogoliaFilterField]);

  useEffect(() => {
    if (history.location?.pathname === '/') {
      setShowSearchBar(true);
    } else {
      setShowSearchBar(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords, index?: number) => {
      if (requestImages.length > 1 && !isUndefined(index)) {
        updateRegion(r, index);
        multiImageSearchOnRegionChange(r, index);
      } else {
        updateRegion(r, 0);
        setImageSelection(r);
        dispatch(selectionChanged(r));
        findItemsInSelection(r, requestImages[0]);
      }
      feedbackRegionEpic(stateGlobal, r);
    }, 50),
    [findItemsInSelection, stateGlobal.search],
  );

  const multiImageSearchOnRegionChange = useCallback(
    (r: RectCoords, index: number) => {
      let modifiedRegions = [...imageRegions];
      modifiedRegions[index] = r;
      multiImageSearch({
        images: requestImages,
        regions: modifiedRegions,
        settings,
      });
    },
    [imageRegions, multiImageSearch, requestImages, settings],
  );

  const filteredRegions = useFilteredRegions(regions, imageSelection);

  const showPostFilter = useMemo(() => {
    return (
      isPostFilterEnabled &&
      ((allSearchResults?.hits.length > 0 && isAlgoliaEnabled) ||
        results?.length > 0)
    );
  }, [isPostFilterEnabled, allSearchResults, isAlgoliaEnabled, results]);

  const showSidePanel = useMemo(() => {
    return requestImage || (isPostFilterEnabled && showPostFilter);
  }, [showPostFilter, isPostFilterEnabled, requestImage]);

  useEffect(() => {
    if (!settings.showFeedback || results?.length === 0 || !showFeedback)
      return;

    const handleScroll = () => {
      setTimeout(() => {
        setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
        dispatch(setShowFeedback(false));
      }, 100);
    };

    setTimeout(() => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
      dispatch(setShowFeedback(false));
    }, 4000);

    window.addEventListener('scroll', handleScroll, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback, settings.showFeedback]);

  const submitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);

    setFeedbackStatus('submitted');
    dispatch(setShowFeedback(false));
    feedbackSuccessEpic(stateGlobal, data);
  };

  return (
    <>
      <div
        className={`wrap-main-result loading`}
        id="wrap-main-result"
        ref={refBoxResult}
      >
        <>
          {isRfqModalOpen && (
            <RfqModal
              requestImage={requestImage}
              selectedRegion={selectedRegion}
              setIsRfqModalOpen={setIsRfqModalOpen}
              isRfqModalOpen={isRfqModalOpen}
              setRfqStatus={setRfqStatus}
            />
          )}

          {filterString && isAlgoliaEnabled && (
            <Configure query={searchQuery} filters={filterString}></Configure>
          )}
          <div className="box-wrap-result-component">
            {!isMobile && showSearchBar && (
              <div className="box-search">
                <CustomSearchBox />
              </div>
            )}
            <div
              className="box-result"
              style={{
                height: settings.showPoweredByNyris
                  ? 'calc(100vh - 87px)'
                  : 'calc(100vh - 148px)',
              }}
            >
              {!isMobile && showSidePanel && (
                <SidePanel
                  setImageSelection={setImageSelection}
                  allSearchResults={props.allSearchResults}
                  debouncedOnImageSelectionChange={
                    debouncedOnImageSelectionChange
                  }
                  filteredRegions={filteredRegions}
                  imageSelection={imageSelection}
                  showAdjustInfo={showAdjustInfo}
                  showAdjustInfoBasedOnConfidence={
                    showAdjustInfoBasedOnConfidence
                  }
                  showPostFilter={showPostFilter}
                  disjunctiveFacets={props.allSearchResults.disjunctiveFacets}
                />
              )}

              <div
                className={`col-right ${
                  settings.preview && 'ml-auto mr-auto'
                } ${isMobile && 'col-right-result-mobile'}`}
                style={{
                  paddingTop: isMobile ? '0px' : '40px',
                  overflow: !isMobile ? 'auto' : '',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {!isMobile &&
                firstSearchResults &&
                requestImages[0] !== firstSearchImage &&
                !fetchingResults ? (
                  <GoBack />
                ) : (
                  ''
                )}

                {!isMobile && settings.algolia.enabled && (
                  <div className="wrap-box-refinements">
                    <CurrentRefinements statusSwitchButton={true} />
                  </div>
                )}

                {isMobile && settings.preview && requestImage && (
                  <ImagePreview
                    debouncedOnImageSelectionChange={
                      debouncedOnImageSelectionChange
                    }
                    showAdjustInfoBasedOnConfidence={
                      showAdjustInfoBasedOnConfidence
                    }
                    showAdjustInfo={showAdjustInfo}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    backgroundColor: '#FAFAFA',
                  }}
                  className="mt-4 desktop:mt-0"
                >
                  {isMobile &&
                  firstSearchResults &&
                  requestImages[0] !== firstSearchImage &&
                  !fetchingResults ? (
                    <div className="go-back-mobile-container">
                      <GoBack />
                    </div>
                  ) : (
                    ''
                  )}

                  <div
                    className={'box-item-result ml-auto mr-auto'}
                    style={{
                      paddingLeft: isMobile ? 0 : 16,
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <div
                      className="box-item-result ml-auto mr-auto"
                      style={{ height: 'fit-content' }}
                    >
                      {!isMobile && !settings.algolia.enabled && (
                        <SelectedPostFilter />
                      )}
                      <ProductList
                        getUrlToCanvasFile={getUrlToCanvasFile}
                        setLoading={false}
                        sendFeedBackAction={sendFeedBackAction}
                        requestImage={requestImage}
                        searchQuery={searchQuery}
                      />
                      <div
                        className="box-item-result ml-auto mr-auto"
                        style={{ position: 'absolute' }}
                      >
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
                          !showFeedbackSuccess && (
                            <div className={'feedback-floating'}>
                              <div className="feedback-section">
                                <Feedback
                                  submitFeedback={submitFeedback}
                                  onFeedbackClose={() => {
                                    setFeedbackStatus('submitted');
                                    dispatch(setShowFeedback(false));
                                  }}
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={'box-item-result ml-auto mr-auto'}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      paddingLeft: isMobile ? 0 : 16,
                    }}
                  >
                    {props.allSearchResults?.hits.length > 0 &&
                      (requestImage || searchQuery) && (
                        <div
                          className="pagination-result"
                          style={{
                            width: '100%',
                            marginTop: '24px',
                            padding: '0 20%',
                          }}
                        >
                          <Pagination
                            showFirst={false}
                            translations={{
                              previous: (
                                <ArrowLeftIcon style={{ color: '#161616' }} />
                              ),
                              next: (
                                <ArrowRightIcon style={{ color: '#161616' }} />
                              ),
                            }}
                          />
                        </div>
                      )}
                    <div
                      style={{
                        display: 'flex',
                        flexGrow: 1,
                        marginTop: !isAlgoliaEnabled ? '24px' : '',
                      }}
                    >
                      {requestImage &&
                        !loadingSearchAlgolia &&
                        !props.isSearchStalled &&
                        settings.rfq &&
                        settings.rfq.enabled && (
                          <RfqBanner
                            rfqRef={rfqRef}
                            rfqStatus={rfqStatus}
                            setIsRfqModalOpen={setIsRfqModalOpen}
                            requestImage={requestImage}
                            selectedRegion={selectedRegion}
                          />
                        )}
                      {!loadingSearchAlgolia &&
                        !props.isSearchStalled &&
                        settings.support &&
                        settings.support.enabled &&
                        (searchQuery || requestImage) && (
                          <InquiryBanner
                            requestImage={requestImage}
                            selectedRegion={selectedRegion}
                            query={searchQuery}
                          />
                        )}
                    </div>
                  </div>
                </div>
                {!isMobile &&
                  props.allSearchResults?.hits?.length > 0 &&
                  isAlgoliaEnabled && (
                    <div>
                      <div className="box-notify">
                        <FooterResult search={search}>
                          <div
                            style={{ padding: '0 20px', display: 'flex' }}
                            className="box-change-hit-items"
                          >
                            <span style={{ paddingRight: '10px' }}>
                              {t('Items per page')}:
                            </span>
                            <HitsPerPage
                              items={showHits}
                              defaultRefinement={20}
                            />
                          </div>
                        </FooterResult>
                      </div>
                    </div>
                  )}
                {isMobile && settings.showPoweredByNyris && (
                  <div
                    style={{
                      backgroundColor: '#FAFAFA',
                      display: 'flex',
                      justifyContent: 'center',
                      paddingBottom: '46px',
                      paddingTop: '8px',
                    }}
                  >
                    <PoweredByNyrisImage
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        window.open('https://www.nyris.io', '_blank');
                      }}
                      color="#AAABB5"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      </div>
    </>
  );
}

export default connectStateResults<Props>(memo(ResultComponent));
