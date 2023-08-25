import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import KeyboardArrowRightOutlinedIcon from '@material-ui/icons/KeyboardArrowRightOutlined';
import KeyboardArrowLeftOutlinedIcon from '@material-ui/icons/KeyboardArrowLeftOutlined';

import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { CurrentRefinements } from 'components/current-refinements/current-refinements';
import FooterResult from 'components/FooterResult';
import CustomSearchBox from 'components/input/inputSearch';
import ProductList from 'components/ProductList';
import ExpandablePanelComponent from 'components/PanelResult';
import { debounce, isEmpty } from 'lodash';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import {
  Configure,
  connectStateResults,
  HitsPerPage,
  Pagination,
} from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { feedbackRegionEpic, feedbackSuccessEpic } from 'services/Feedback';
import { createImage, findByImage, findRegions } from 'services/image';
import { showFeedback, showResults } from 'Store/nyris/Nyris';
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
import { getCroppedCanvas } from 'helpers/getCroppedCanvas';

interface Props {
  allSearchResults: any;
  isSearchStalled?: boolean;
}

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const refBoxResult: any = useRef(null);
  const stateGlobal = useAppSelector((state: any) => state);
  const { search, settings } = stateGlobal;

  const {
    requestImage,
    regions,
    selectedRegion,
    preFilter,
    loadingSearchAlgolia,
    imageThumbSearchInput,
  } = search;

  const moreInfoText = settings?.productCtaText;
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
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
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (requestImage) {
      setIsScrolled('not-scrolled');
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
      return findByImage({
        image: canvas,
        settings,
        region: r,
        filters: !isEmpty(preFilter) ? preFilterValues : undefined,
      })
        .then(res => {
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
      return dispatch(showFeedback());
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
    dispatch(showResults());
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
    findByImage({
      image,
      settings,
      region: searchRegion,
      filters: !isEmpty(preFilter) ? preFilterValues : undefined,
    }).then(res => {
      dispatch(setSearchResults(res));
      dispatch(showFeedback());
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

    if (requestImage || isEmpty(search.valueTextSearch.query)) return;
    const preFilterValues = Object.keys(preFilter) as string[];
    const filter =
      preFilterValues.length > 0
        ? preFilterValues
            .map(item => `${settings.alogoliaFilterField}:'${item}'`)
            .join(' OR ')
        : '';

    setFilterString(filter);
  }, [
    preFilter,
    requestImage,
    search.valueTextSearch.query,
    settings.alogoliaFilterField,
  ]);

  useEffect(() => {
    if (!requestImage) {
      return;
    }
    dispatch(updateStatusLoading(true));
    const { canvas }: any = requestImage;
    findImageByApiNyris(canvas).then((res: any) => {
      // setPreFilter(keyFilter);
      dispatch(updateResultChangePosition(res));
    });
    dispatch(showFeedback());

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
      feedbackRegionEpic(stateGlobal, r);
      dispatch(selectionChanged(r));
      findItemsInSelection(r);
    }, 500),
    [findItemsInSelection, stateGlobal.search],
  );

  const filteredRegions = useMemo(
    () =>
      regions.map(
        (region: {
          normalizedRect: { x1: any; x2: any; y1: any; y2: any };
        }) => {
          if (
            region.normalizedRect.x1 === imageSelection.x1 &&
            region.normalizedRect.x2 === imageSelection.x2 &&
            region.normalizedRect.y1 === imageSelection.y1 &&
            region.normalizedRect.y2 === imageSelection.y2
          ) {
            return { ...region, show: false };
          }
          if (
            imageSelection.x1 === 0 &&
            imageSelection.x2 === 1 &&
            imageSelection.y1 === 0 &&
            imageSelection.y2 === 1
          ) {
            return { ...region, show: false };
          }

          return { ...region, show: true };
        },
      ),
    [imageSelection, regions],
  );

  const showPostFilter = useMemo(() => {
    return settings.postFilterOption && props.allSearchResults?.hits.length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.postFilterOption, props.allSearchResults?.hits]);

  const showSidePanel = useMemo(() => {
    return requestImage || (settings.postFilterOption && showPostFilter);
  }, [showPostFilter, settings.postFilterOption, requestImage]);

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

  return (
    <>
      <div
        className={`wrap-main-result loading`}
        id="wrap-main-result"
        ref={refBoxResult}
      >
        <>
          <RfqModal
            requestImage={requestImage}
            selectedRegion={selectedRegion}
            setIsRfqModalOpen={setIsRfqModalOpen}
            isRfqModalOpen={isRfqModalOpen}
            setRfqStatus={setRfqStatus}
          />
          {filterString && (
            <Configure
              query={search.valueTextSearch.query}
              filters={filterString}
            ></Configure>
          )}
          <Box className="box-wrap-result-component">
            {!isMobile && (
              <div className="box-search">
                <CustomSearchBox />
              </div>
            )}
            <Box className="box-result">
              <>
                {!isMobile && (
                  <>
                    {showSidePanel && (
                      <Box
                        className={`wrap-main-col-left ${
                          toggleColLeft ? 'toggle' : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box
                          className="box-toggle-coloumn"
                          style={{
                            right:
                              requestImage || toggleColLeft ? '0px' : '16px',
                          }}
                        >
                          <Button
                            style={{
                              color: '#55566b',
                              height: '32px',
                            }}
                            onClick={() => {
                              setToggleColLeft(!toggleColLeft);
                            }}
                          >
                            {toggleColLeft ? (
                              <KeyboardArrowRightOutlinedIcon />
                            ) : (
                              <KeyboardArrowLeftOutlinedIcon />
                            )}
                          </Button>
                        </Box>
                        <Box>
                          {settings.preview && requestImage && (
                            <Box className="col-left">
                              <Box className="box-preview">
                                <Box
                                  className="preview-item"
                                  style={{
                                    backgroundColor: 'white',
                                    paddingTop: '32px',
                                    width: '100%',
                                  }}
                                >
                                  <div
                                    style={{
                                      backgroundColor: '#F3F3F5',
                                      width: '100%',
                                      paddingTop: '16px',
                                      paddingBottom: '16px',
                                    }}
                                  >
                                    <Preview
                                      key={requestImage?.id}
                                      onSelectionChange={(r: RectCoords) => {
                                        setImageSelection(r);
                                        debouncedOnImageSelectionChange(r);
                                      }}
                                      image={requestImage?.canvas}
                                      selection={
                                        imageSelection || DEFAULT_REGION
                                      }
                                      regions={filteredRegions}
                                      maxWidth={288}
                                      maxHeight={288}
                                      dotColor={'#FBD914'}
                                      minCropWidth={60}
                                      minCropHeight={60}
                                      rounded={true}
                                    />
                                  </div>
                                </Box>
                              </Box>
                              {(showAdjustInfoBasedOnConfidence ||
                                showAdjustInfo) && (
                                <Box
                                  className="box-title_col-left"
                                  alignItems="center"
                                  style={{
                                    backgroundColor: '#3E36DC',
                                    display: 'flex',
                                    columnGap: '6px',
                                    padding: '5px',
                                  }}
                                >
                                  <IconInfo color="white" />
                                  <Typography
                                    style={{
                                      fontSize: 10,
                                      color: '#fff',
                                    }}
                                  >
                                    {showAdjustInfo
                                      ? t('Crop the image for better results')
                                      : 'Crop the image for better results'}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {showPostFilter && (
                            <Box className="col-left__bottom">
                              <ExpandablePanelComponent
                                disjunctiveFacets={
                                  props.allSearchResults.disjunctiveFacets
                                }
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                  </>
                )}

                <Box
                  className={`col-right ${
                    settings.preview && 'ml-auto mr-auto'
                  } ${isMobile && 'col-right-result-mobile'}`}
                  style={{
                    paddingTop: isMobile ? '16px' : '40px',
                    overflow: !isMobile ? 'auto' : '',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {!isMobile && (
                    <Box className="wrap-box-refinements">
                      <CurrentRefinements statusSwitchButton={true} />
                    </Box>
                  )}

                  {isMobile && settings.preview && requestImage && (
                    <Box
                      className="col-left"
                      style={{
                        backgroundColor: '#AAABB5',
                        marginBottom: '15px',
                      }}
                    >
                      {
                        <Box className="box-preview">
                          <Box
                            className="preview-item"
                            style={{ backgroundColor: 'white' }}
                          >
                            <Preview
                              key={requestImage?.id}
                              onSelectionChange={(r: RectCoords) => {
                                setImageSelection(r);
                                debouncedOnImageSelectionChange(r);
                              }}
                              image={requestImage?.canvas}
                              selection={imageSelection || DEFAULT_REGION}
                              regions={filteredRegions}
                              maxWidth={240}
                              maxHeight={240}
                              dotColor={'#FBD914'}
                              minCropWidth={60}
                              minCropHeight={60}
                              rounded={false}
                            />
                          </Box>
                          {(showAdjustInfoBasedOnConfidence ||
                            showAdjustInfo) && (
                            <Box
                              className="box-title_col-left"
                              alignItems="center"
                              style={{
                                backgroundColor: '#3E36DC',
                                display: 'flex',
                                columnGap: '6px',
                                padding: '5px',
                                width: 'fit-content',
                              }}
                            >
                              <IconInfo color="white" />
                              <Typography
                                style={{
                                  fontSize: 10,
                                  color: '#fff',
                                }}
                              >
                                {showAdjustInfo
                                  ? t('Crop the image for better results')
                                  : 'Crop the image for better results'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    </Box>
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
                      <ProductList
                        getUrlToCanvasFile={getUrlToCanvasFile}
                        setLoading={false}
                        sendFeedBackAction={sendFeedBackAction}
                        moreInfoText={moreInfoText}
                        requestImage={requestImage}
                        searchQuery={search.valueTextSearch.query}
                      />
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
                        {props.allSearchResults?.hits.length > 0 &&
                          (requestImage || search.valueTextSearch.query) && (
                            <Pagination
                              showFirst={false}
                              translations={{
                                previous: (
                                  <ArrowLeftIcon style={{ color: '#161616' }} />
                                ),
                                next: (
                                  <ArrowRightIcon
                                    style={{ color: '#161616' }}
                                  />
                                ),
                              }}
                            />
                          )}
                      </Box>

                      {requestImage &&
                        !loadingSearchAlgolia &&
                        !props.isSearchStalled &&
                        settings.rfq && (
                          <Box
                            style={{
                              padding: '0px 16px 0px 16px',
                              backgroundColor: '#F6F3F1',
                              width: '100%',
                              marginBottom: !isMobile ? '32px' : '0px',
                              alignSelf: 'end',
                              height: '248px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            className="rfq-box"
                            ref={rfqRef}
                          >
                            <Box
                              style={{
                                width: '100%',
                                display: 'flex',
                                columnGap: '16px',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                              }}
                            >
                              <Box>
                                <Box
                                  style={{
                                    paddingBottom: '12px',
                                  }}
                                >
                                  <Box
                                    style={{
                                      fontSize: '14px',
                                      color:
                                        rfqStatus === 'inactive'
                                          ? '#4B4B4A'
                                          : '#CACAD1',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    No Matches Found?
                                  </Box>
                                  <Box
                                    style={{
                                      fontSize: '12px',
                                      maxWidth: '320x',
                                      lineHeight: '14.1px',
                                      color:
                                        rfqStatus === 'inactive'
                                          ? '#4B4B4A'
                                          : '#CACAD1',
                                      fontWeight: 'normal',
                                    }}
                                  >
                                    Get personalised help from our team of
                                    product experts
                                  </Box>
                                </Box>
                                <button
                                  style={{
                                    maxWidth: '200px',
                                    background:
                                      rfqStatus === 'inactive'
                                        ? '#4B4B4A'
                                        : '#E9E9EC',
                                    boxShadow:
                                      rfqStatus === 'inactive'
                                        ? '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'
                                        : '',
                                    borderRadius: '2px',
                                    padding: '16px 16px 16px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color:
                                      rfqStatus === 'inactive'
                                        ? '#fff'
                                        : '#CACAD1',
                                    fontSize: '14px',
                                    height: '48px',
                                    cursor:
                                      rfqStatus === 'inactive'
                                        ? 'pointer'
                                        : 'default',
                                    border: 'none',
                                  }}
                                  disabled={rfqStatus !== 'inactive'}
                                  onClick={() => {
                                    setIsRfqModalOpen(true);
                                  }}
                                >
                                  Request a Quote
                                </button>
                              </Box>
                              <div>
                                <img
                                  src={getCroppedCanvas(
                                    requestImage?.canvas,
                                    selectedRegion,
                                  )?.toDataURL()}
                                  alt="request_image"
                                  style={{
                                    mixBlendMode:
                                      rfqStatus !== 'inactive'
                                        ? 'overlay'
                                        : 'unset',
                                    maxHeight: '181px',
                                    maxWidth: '181px',
                                    borderRadius: '2px',
                                  }}
                                />
                              </div>
                            </Box>
                          </Box>
                        )}
                    </Box>
                  </Box>
                  {!isMobile && props.allSearchResults?.hits?.length > 0 && (
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
                </Box>
              </>
            </Box>
          </Box>
        </>
      </div>
      {isScrolled === 'scrolled' &&
        requestImage &&
        isMobile &&
        props.allSearchResults.hits.length > 0 &&
        settings.rfq && (
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
