import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Collapse, Typography } from '@material-ui/core';
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
import LoadingScreenCustom from 'components/LoadingScreen';
import ExpandablePanelComponent from 'components/PanelResult';
import { debounce, isEmpty } from 'lodash';
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
import { showFeedback, showResults } from 'Store/Nyris';
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
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { showHits } from './MockData';
import { MobileDetails } from '../../components/MobileDetails';
import { ShareModal } from '../../components/ShareModal';

interface Props {
  allSearchResults: any;
}

const defaultSelection = { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 };

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
    mobileDetailsPreview,
  } = search;
  const moreInfoText = settings?.productCtaText;
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [imageSelection, setImageSelection] = useState(selectedRegion);
  const executeScroll = () => refBoxResult.current.scrollIntoView('-100px');
  const [filterString, setFilterString] = useState<string>();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);

  useEffect(() => {
    if (requestImage) {
      executeScroll();
      setImageSelection(null);
    }
  }, [requestImage]);

  const findImageByApiNyris = useCallback(
    async (canvas: any, r?: RectCoords) => {
      const preFilter = [
        {
          key: settings.filterType,
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
    }, 1000),
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
        key: settings.filterType,
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
        .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}>`)
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

  return (
    <div
      className={`wrap-main-result loading`}
      id="wrap-main-result"
      ref={refBoxResult}
    >
      <>
        {filterString && <Configure filters={filterString}></Configure>}
        <Box className="box-wrap-result-component">
          {!isMobile && (
            <div className="box-search">
              <CustomSearchBox />
            </div>
          )}
          <Box
            className="box-result"
            style={mobileDetailsPreview ? { paddingTop: 0 } : {}}
          >
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
                          style={
                            requestImage && !toggleColLeft
                              ? { color: '#fff' }
                              : { color: '#55566b' }
                          }
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
                          style={{
                            backgroundColor:
                              settings?.themePage?.searchSuite?.primaryColor,
                          }}
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
                                selection={imageSelection || defaultSelection}
                                regions={regions}
                                maxWidth={320}
                                maxHeight={320}
                                dotColor="#FBD914"
                              />
                            </Box>
                          </Box>
                          <Box className="box-title_col-left">
                            <Typography style={{ fontSize: 11, color: '#fff' }}>
                              Adjust the selection frame for better results.
                            </Typography>
                          </Box>
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
                  marginTop: keyFilter ? '64px' : isMobile ? '15px' : '0px',
                }}
              >
                <Box className="wrap-box-refinements">
                  <CurrentRefinements statusSwitchButton={true} />
                </Box>
                {isMobile &&
                  settings.preview &&
                  requestImage &&
                  !mobileDetailsPreview && (
                    <Box
                      className="col-left"
                      style={{
                        backgroundColor:
                          settings?.themePage?.searchSuite?.primaryColor,
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
                              selection={imageSelection || defaultSelection}
                              regions={regions}
                              maxWidth={320}
                              maxHeight={320}
                              dotColor="#3E36DC"
                            />
                          </Box>
                        </Box>
                      }
                    </Box>
                  )}
                {isMobile && (
                  <Collapse in={mobileDetailsPreview}>
                    {selectedItem && (
                      <Box
                        className="col-left"
                        style={{
                          backgroundColor: '#fff',
                          marginBottom: '15px',
                        }}
                      >
                        <MobileDetails
                          item={selectedItem}
                          setOpenModalShare={setOpenModalShare}
                          handlerFeedback={sendFeedBackAction}
                        />
                      </Box>
                    )}
                  </Collapse>
                )}

                <Box className={'box-item-result ml-auto mr-auto'}>
                  <LoadingScreenCustom
                    getUrlToCanvasFile={getUrlToCanvasFile}
                    setLoading={false}
                    sendFeedBackAction={sendFeedBackAction}
                    moreInfoText={moreInfoText}
                    requestImage={requestImage}
                    searchQuery={search.valueTextSearch.query}
                    setSelectedItem={setSelectedItem}
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
                  {/* {isMobile && (
                    <Box
                      className="box-title_col-left"
                      style={{
                        height: 86,
                        background:
                          'linear-gradient(360deg, #56577C 0%, #2B2C46 100%)',
                        width: '100%',
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 11,
                          color: '#fff',
                          textAlign: 'center',
                          marginTop: 18,
                        }}
                      >
                        <span className="fw-700">Wrong results?</span> share
                        your search with our{' '}
                        <span style={{ textDecoration: 'underline' }}>
                          <a href="/#" className="fw-700 text-white">
                            product experts
                          </a>
                        </span>
                      </Typography>
                    </Box>
                  )} */}
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
                      Items per page:
                    </span>
                    <HitsPerPage items={showHits} defaultRefinement={20} />
                  </Box>
                </FooterResult>
              </Box>
            </Box>
          )}
        </Box>
        {mobileDetailsPreview && (
          <ShareModal
            setModalState={setOpenModalShare}
            dataItem={selectedItem}
            isOpen={isOpenModalShare}
          />
        )}
      </>
    </div>
  );
}

export default connectStateResults<Props>(memo(ResultComponent));
