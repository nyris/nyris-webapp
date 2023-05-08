import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import KeyboardArrowRightOutlinedIcon from '@material-ui/icons/KeyboardArrowRightOutlined';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import IconSupport from 'common/assets/icons/support3.svg';
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
import { Link } from 'react-router-dom';
import { feedbackClickEpic, feedbackSuccessEpic } from 'services/Feedback';
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
import { AppState } from 'types';

interface Props {
  allSearchResults: any;
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
    keyFilter,
    loadingSearchAlgolia,
  } = search;
  const moreInfoText = settings?.productCtaText;
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [imageSelection, setImageSelection] = useState<any>(null);
  const executeScroll = () => refBoxResult.current.scrollIntoView('-100px');
  const [filterString, setFilterString] = useState<string>();
  const { t } = useTranslation();
  const [showAdjustInfo, setAdjustInfo] = useState(false);
  const imageIdRef = useRef(null);

  useEffect(() => {
    if (
      !loadingSearchAlgolia &&
      requestImage &&
      requestImage?.id !== imageIdRef.current
    ) {
      setAdjustInfo(true);
      const timeout = setTimeout(() => {
        setAdjustInfo(false);
      }, 3000);
      imageIdRef.current = requestImage?.id;
      return () => {
        clearTimeout(timeout);
        setAdjustInfo(false);
      };
    }
  }, [requestImage, loadingSearchAlgolia]);

  useEffect(() => {
    if (selectedRegion) {
      setImageSelection(selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (requestImage) {
      executeScroll();
      setImageSelection(DEFAULT_REGION);
    }
  }, [requestImage]);

  const findImageByApiNyris = useCallback(
    async (canvas: any, r?: RectCoords) => {
      const preFilter = [
        {
          key: settings.visualSearchFilterKey,
          values: [`${keyFilter}`],
        },
      ];
      dispatch(loadingActionResults());
      return findByImage({
        image: canvas,
        settings,
        region: r,
        filters: keyFilter ? preFilter : undefined,
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
    [settings, dispatch, keyFilter],
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
  const getUrlToCanvasFile = async (url: string, position?: number) => {
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

    if (position) {
      feedbackClickEpic(stateGlobal, position);
      return;
    }
    let searchRegion: RectCoords | undefined = undefined;

    if (settings.regions) {
      let res = await findRegions(image, settings);
      searchRegion = res.selectedRegion;
      dispatch(setRegions(res.regions));
      dispatch(setSelectedRegion(searchRegion));
    }
    const preFilter = [
      {
        key: settings.visualSearchFilterKey,
        values: [`${keyFilter}`],
      },
    ];
    findByImage({
      image,
      settings,
      region: searchRegion,
      filters: keyFilter ? preFilter : undefined,
    }).then(res => {
      dispatch(setSearchResults(res));
      dispatch(showFeedback());
      dispatch(updateStatusLoading(false));
      return;
    });
  };
  const nonEmptyFilter: any[] = !requestImage
    ? []
    : ['sku:DOES_NOT_EXIST<score=1>'];
  const filterSkus: any = search?.results
    ? search?.results
        .slice()
        .reverse()
        .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
    : '';
  const filterSkusString = [...nonEmptyFilter, ...filterSkus].join(' OR ');

  useEffect(() => {
    document.title = 'Search results';

    if (requestImage || isEmpty(search.valueTextSearch.query)) return;

    const filter = keyFilter
      ? `${settings.alogoliaFilterField}:'${keyFilter}'`
      : '';
    setFilterString(filter);
  }, [
    keyFilter,
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
  }, [keyFilter]);

  useEffect(() => {
    if (!requestImage) return;
    const filter = keyFilter
      ? filterSkusString
        ? `(${filterSkusString}) AND ${settings.alogoliaFilterField}:'${keyFilter}'`
        : `${settings.alogoliaFilterField}:'${keyFilter}'`
      : filterSkusString;
    setFilterString(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSkusString, settings.alogoliaFilterField]);

  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      dispatch(selectionChanged(r));
      findItemsInSelection(r);
    }, 500),
    [findItemsInSelection],
  );

  const filteredRegions = useMemo(
    () =>
      regions.filter(
        (region: {
          normalizedRect: { x1: any; x2: any; y1: any; y2: any };
        }) => {
          if (
            region.normalizedRect.x1 === imageSelection.x1 &&
            region.normalizedRect.x2 === imageSelection.x2 &&
            region.normalizedRect.y1 === imageSelection.y1 &&
            region.normalizedRect.y2 === imageSelection.y2
          ) {
            return false;
          }
          if (
            imageSelection.x1 === 0 &&
            imageSelection.x2 === 1 &&
            imageSelection.y1 === 0 &&
            imageSelection.y2 === 1
          ) {
            return false;
          }

          return true;
        },
      ),
    [imageSelection, regions],
  );

  return (
    <div
      className={`wrap-main-result loading`}
      id="wrap-main-result"
      ref={refBoxResult}
    >
      <>
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
              <Box className="btn-open-support">
                <Link to={'/support'} style={{ color: '#3E36DC' }}>
                  <img src={IconSupport} alt="" width={16} height={16} />
                </Link>
              </Box>
              {!isMobile && (
                <>
                  {((!settings.postFilterOption && requestImage) ||
                    settings.postFilterOption) && (
                    <Box
                      className={`wrap-main-col-left ${
                        toggleColLeft ? 'toggle' : ''
                      }`}
                    >
                      <Box className="box-toggle-coloumn">
                        <Button
                          style={{ color: '#55566b' }}
                          onClick={() => {
                            setToggleColLeft(!toggleColLeft);
                          }}
                        >
                          {toggleColLeft ? (
                            <KeyboardArrowRightOutlinedIcon
                              style={{ fontSize: 30 }}
                            />
                          ) : (
                            <ArrowBackIosOutlinedIcon
                              style={{ fontSize: 20 }}
                            />
                          )}
                        </Button>
                      </Box>
                      {settings.preview && requestImage && (
                        <Box
                          className="col-left"
                          // style={{
                          //   backgroundColor: settings?.theme?.primaryColor,
                          // }}
                        >
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
                                maxWidth={320}
                                maxHeight={320}
                                dotColor={settings.theme.primaryColor}
                                gripColor={settings.theme.primaryColor}
                              />
                            </Box>
                          </Box>
                          {showAdjustInfo && (
                            <Box
                              className="box-title_col-left"
                              display="flex"
                              alignItems="center"
                              style={{ backgroundColor: '#3E36DC' }}
                            >
                              <IconInfo style={{ marginRight: 2 }} />
                              <Typography
                                style={{ fontSize: 9, color: '#fff' }}
                              >
                                {t(
                                  'Adjust the search frame around your object for improved results',
                                )}
                                .
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                      {/* TODO: Filter list Choose */}
                      {settings.postFilterOption && (
                        <Box className="col-left__bottom">
                          <ExpandablePanelComponent />
                        </Box>
                      )}
                    </Box>
                  )}
                </>
              )}

              <Box
                className={`col-right ${
                  settings.preview && 'ml-auto mr-auto'
                } ${isMobile && 'col-right-result-mobile'}`}
                style={{
                  marginTop:
                    keyFilter && isMobile ? '105px' : isMobile ? '60px' : '0px',
                }}
              >
                <Box className="wrap-box-refinements">
                  <CurrentRefinements statusSwitchButton={true} />
                </Box>
                {isMobile && settings.preview && requestImage && (
                  <Box
                    className="col-left"
                    style={{
                      backgroundColor: settings?.theme?.primaryColor,
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
                            maxWidth={320}
                            maxHeight={320}
                            dotColor={settings.theme.primaryColor}
                            gripColor={settings.theme.primaryColor}
                          />
                        </Box>
                        {showAdjustInfo && (
                          <Box
                            className="box-title_col-left"
                            display="flex"
                            alignItems="center"
                            style={{ backgroundColor: '#3E36DC' }}
                          >
                            <IconInfo style={{ marginRight: 2 }} />
                            <Typography style={{ fontSize: 9, color: '#fff' }}>
                              {t(
                                'Adjust the search frame around your object for improved results',
                              )}
                              .
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  </Box>
                )}

                <Box className={'box-item-result ml-auto mr-auto'}>
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
                      margin: '20px auto',
                      padding: '0 20%',
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
                              <ArrowRightIcon style={{ color: '#161616' }} />
                            ),
                          }}
                        />
                      )}
                  </Box>
                </Box>
              </Box>
            </>
          </Box>
          {!isMobile && (
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
                    <HitsPerPage items={showHits} defaultRefinement={20} />
                  </Box>
                </FooterResult>
              </Box>
            </Box>
          )}
        </Box>
      </>
    </div>
  );
}

export default connectStateResults<Props>(memo(ResultComponent));
