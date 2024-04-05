import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box } from '@material-ui/core';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { RectCoords } from '@nyris/nyris-api';
import { CurrentRefinements } from 'components/current-refinements/current-refinements';
import FooterResult from 'components/FooterResult';
import CustomSearchBox from 'components/input/inputSearch';
import ProductList from 'components/ProductList';
import { debounce, isEmpty } from 'lodash';
import {
  Configure,
  connectStateResults,
  HitsPerPage,
  Pagination,
} from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { feedbackRegionEpic, feedbackSuccessEpic } from 'services/Feedback';
import { createImage, find, findRegions } from 'services/image';
import {
  loadingActionResults,
  onToggleModalItemDetail,
  selectionChanged,
  setImageSearchInput,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
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
import ImagePreviewMobile from 'components/ImagePreviewMobile';
import RfqBanner from 'components/rfq/RfqBanner';
import InquiryBanner from 'components/Inquiry/InquiryBanner';
import { useQuery } from 'hooks/useQuery';
import { ReactComponent as PoweredByNyrisImage } from 'common/assets/images/powered_by_nyris.svg';
import Feedback from 'components/Feedback';
import { SelectedPostFilter } from 'components/SelectedPostFilter';

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
    imageThumbSearchInput,
    results,
  } = search;

  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [imageSelection, setImageSelection] = useState<any>(null);
  const executeScroll = () => refBoxResult.current.scrollIntoView('-100px');
  const [filterString, setFilterString] = useState<string>();
  const { t } = useTranslation();
  const [showAdjustInfo, setAdjustInfo] = useState(false);
  const [showAdjustInfoBasedOnConfidence, setShowAdjustInfoBasedOnConfidence] =
    useState(false);
  const [rfqStatus, setRfqStatus] = useState<'inactive' | 'loading' | 'sent'>(
    'inactive',
  );
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const imageUploadRef = useRef(null);
  const rfqRef = useRef<any>(null);
  const [isScrolled, setIsScrolled] = useState<
    'not-scrolled' | 'scrolled' | 'user-scrolled'
  >('not-scrolled');

  const [showFeedback, setShowFeedback] = useState<
    'not-scrolled' | 'scrolled' | 'user-scrolled'
  >('not-scrolled');

  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const query = useQuery();
  const searchQuery = query.get('query') || search.valueTextSearch.query;
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const isPostFilterEnabled = settings.postFilterOption;

  useEffect(() => {
    if (
      !loadingSearchAlgolia &&
      (imageThumbSearchInput.includes('blob:') ||
        imageThumbSearchInput.includes('data:')) &&
      imageUploadRef.current !== imageThumbSearchInput
    ) {
      setAdjustInfo(true);
      const timeout = setTimeout(() => {
        setAdjustInfo(false);
      }, 2000);
      imageUploadRef.current = imageThumbSearchInput;
      return () => {
        clearTimeout(timeout);
        setAdjustInfo(false);
      };
    }
  }, [imageThumbSearchInput, loadingSearchAlgolia]);

  useEffect(() => {
    if (selectedRegion) {
      setImageSelection(selectedRegion);
      setRfqStatus('inactive');
      setIsScrolled('not-scrolled');
      setShowFeedback('not-scrolled');
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (requestImage) {
      setIsScrolled('not-scrolled');
      setShowFeedback('not-scrolled');
      executeScroll();
      setImageSelection(DEFAULT_REGION);
    }
  }, [requestImage]);

  const findImageByApiNyris = useCallback(
    async (canvas: any, r?: RectCoords) => {
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter) as string[],
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
  const findItemsInSelection = useCallback(
    debounce(async (r: RectCoords) => {
      if (!requestImage) {
        return;
      }
      dispatch(updateStatusLoading(true));
      const { canvas }: any = requestImage;
      findImageByApiNyris(canvas, r).then((res: any) => {
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
      });
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
    dispatch(setImageSearchInput(url));
    let image = await createImage(url);
    dispatch(setRequestImage(image));

    let searchRegion: RectCoords | undefined = undefined;

    if (settings.regions) {
      let res = await findRegions(image, settings);
      searchRegion = res.selectedRegion;
      dispatch(setRegions(res.regions));
      dispatch(setSelectedRegion(searchRegion));
    }
    const preFilterValues = [
      {
        key: settings.visualSearchFilterKey,
        values: Object.keys(preFilter) as string[],
      },
    ];
    find({
      image,
      settings,
      region: searchRegion,
      filters: !isEmpty(preFilter) ? preFilterValues : undefined,
    }).then((res: any) => {
      dispatch(setSearchResults(res));
      dispatch(updateStatusLoading(false));
      return;
    });
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

  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      setImageSelection(r);
      feedbackRegionEpic(stateGlobal, r);
      dispatch(selectionChanged(r));
      findItemsInSelection(r);
    }, 50),
    [findItemsInSelection, stateGlobal.search],
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
    const handleScroll = () => {
      setTimeout(() => {
        setIsScrolled(s => (s === 'not-scrolled' ? 'scrolled' : s));
        setTimeout(() => {
          setIsScrolled(s => (s === 'scrolled' ? 'user-scrolled' : s));
        }, 5000);
      }, 1000);
    };
    if (requestImage)
      window.addEventListener('scroll', handleScroll, { capture: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [requestImage]);

  useEffect(() => {
    if (!requestImage || !settings.showFeedback) return;

    setTimeout(() => {
      setShowFeedback(s => (s === 'not-scrolled' ? 'scrolled' : s));
    }, 5000);

    const handleScroll = () => {
      setTimeout(() => {
        setShowFeedback(s => (s === 'not-scrolled' ? 'scrolled' : s));
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { capture: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [requestImage, selectedRegion, settings.showFeedback]);

  const submitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);
    setShowFeedback('user-scrolled');
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
          <Box className="box-wrap-result-component">
            {!isMobile && (
              <div className="box-search">
                <CustomSearchBox />
              </div>
            )}
            <Box
              className="box-result"
              style={{
                height: settings.showPoweredByNyris
                  ? 'calc(100vh - 177px)'
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

              <Box
                className={`col-right ${
                  settings.preview && 'ml-auto mr-auto'
                } ${isMobile && 'col-right-result-mobile'}`}
                style={{
                  paddingTop: isMobile ? '8px' : '40px',
                  overflow: !isMobile ? 'auto' : '',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {!isMobile && settings.algolia.enabled && (
                  <Box className="wrap-box-refinements">
                    <CurrentRefinements statusSwitchButton={true} />
                  </Box>
                )}

                {isMobile && settings.preview && requestImage && (
                  <ImagePreviewMobile
                    requestImage={requestImage}
                    imageSelection={imageSelection}
                    debouncedOnImageSelectionChange={
                      debouncedOnImageSelectionChange
                    }
                    filteredRegions={filteredRegions}
                    showAdjustInfoBasedOnConfidence={
                      showAdjustInfoBasedOnConfidence
                    }
                    showAdjustInfo={showAdjustInfo}
                  />
                )}

                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <Box
                    className={'box-item-result ml-auto mr-auto'}
                    style={{ height: '100%', paddingLeft: isMobile ? 0 : 16 }}
                  >
                    {showFeedbackSuccess && (
                      <div className={'box-item-result feedback-floating'}>
                        <div className="feedback-success">
                          Thanks for your feedback!
                        </div>
                      </div>
                    )}
                    {showFeedback === 'scrolled' && !showFeedbackSuccess && (
                      <div className={'box-item-result feedback-floating'}>
                        <Feedback
                          submitFeedback={submitFeedback}
                          onFeedbackClose={() => {
                            setShowFeedback('user-scrolled');
                          }}
                        />
                      </div>
                    )}
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
                    </div>

                    {props.allSearchResults?.hits.length > 0 &&
                      (requestImage || searchQuery) && (
                        <Box
                          className="pagination-result"
                          style={{
                            width: '100%',
                            margin: !isMobile ? '20px auto' : '',
                            marginBottom:
                              isMobile && !requestImage ? '64px' : '20px',
                            padding: '0 20%',
                            alignSelf: 'end',
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
                        </Box>
                      )}

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
                  </Box>
                </Box>
                {!isMobile &&
                  props.allSearchResults?.hits?.length > 0 &&
                  isAlgoliaEnabled && (
                    <Box>
                      <Box className="box-notify">
                        <FooterResult search={search}>
                          <Box
                            display={'flex'}
                            style={{ padding: '0 20px' }}
                            className="box-change-hit-items"
                          >
                            <span style={{ paddingRight: '10px' }}>
                              {t('Items per page')}:
                            </span>
                            <HitsPerPage
                              items={showHits}
                              defaultRefinement={20}
                            />
                          </Box>
                        </FooterResult>
                      </Box>
                    </Box>
                  )}
                {isMobile && settings.showPoweredByNyris && (
                  <div
                    style={{
                      backgroundColor: '#FAFAFA',
                      display: 'flex',
                      justifyContent: 'center',
                      paddingBottom: '46px',
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
              </Box>
            </Box>
          </Box>
        </>
      </div>
      {isScrolled === 'scrolled' &&
        requestImage &&
        isMobile &&
        props.allSearchResults.hits.length > 0 &&
        settings.rfq &&
        settings.rfq.enabled && (
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '1.16px',
              color: 'white',
              borderRadius: '16px',
              backgroundColor: '#4B4B4A',
              boxShadow: '0px 0px 16px 0px rgba(85, 86, 107, 0.70)',
              padding: '8px 16px',
              zIndex: 100,
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '356px',
              bottom: '86px',
            }}
          >
            Scroll down for personalized support
          </div>
        )}
    </>
  );
}

export default connectStateResults<Props>(memo(ResultComponent));
