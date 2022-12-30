import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from '@material-ui/core';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import KeyboardArrowRightOutlinedIcon from '@material-ui/icons/KeyboardArrowRightOutlined';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import IconEmail from 'common/assets/icons/email_share.svg';
import IconWeChat from 'common/assets/icons/icon_chat.svg';
import IconWhatsApp from 'common/assets/icons/icon_whatapps.svg';
import IconSupport from 'common/assets/icons/support3.svg';
import { CurrentRefinements } from 'components/current-refinements/current-refinements';
import DetailItem from 'components/DetailItem';
import FooterResult from 'components/FooterResult';
import CustomSearchBox from 'components/input/inputSearch';
import LoadingScreenCustom from 'components/LoadingScreen';
import DefaultModal from 'components/modal/DefaultModal';
import ExpandablePanelComponent from 'components/PanelResult';
import { debounce } from 'lodash';
import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
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

interface Props {
  allSearchResults: any;
}

const defaultSelection = { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 };

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const refBoxResult: any = useRef(null);
  const stateGlobal = useAppSelector((state: any) => state);
  const { search, settings } = stateGlobal;
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [numberResult, setNumberResult] = useState<number>(0);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const { results, requestImage, regions, selectedRegion } = search;
  const moreInfoText = settings?.themePage?.searchSuite?.moreInfoText;
  const [dataResult, setDataResult] = useState<any[]>([]);
  const [dataImageModal, setDataImageModal] = useState<any>();
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [imageSelection, setImageSelection] = useState(selectedRegion);
  const executeScroll = () => refBoxResult.current.scrollIntoView('-100px');

  useEffect(() => {
    if (results?.length === 0) {
      setDataResult([]);
      return;
    }
    setDataResult(results);
  }, [results]);

  useEffect(() => {
    if (requestImage) {
      executeScroll();
    }
  }, [requestImage]);

  // TODO: hanlder modal:
  const handlerToggleModal = (item: any) => {
    setOpenModalImage(true);
    dispatch(onToggleModalItemDetail(true));
    dispatch(updateStatusLoading(true));
    setDataImageModal(item);
    setTimeout(() => {
      dispatch(updateStatusLoading(false));
    }, 400);
  };

  const onNextItem = () => {
    if (numberResult === results.length) {
      return;
    }
    setNumberResult(numberResult + 1);
  };

  const onPrevItem = () => {
    if (numberResult === 0) {
      return;
    }
    setNumberResult(numberResult - 1);
  };

  const findImageByApiNyris = useCallback(
    async (canvas: any, r: RectCoords) => {
      return findByImage(canvas, settings, r)
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
    [settings, dispatch],
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
    findByImage(image, settings, searchRegion).then(res => {
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
  const filtersString = [...nonEmptyFilter, ...filterSkus].join(' OR ');
  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      dispatch(selectionChanged(r));
      findItemsInSelection(r);
    }, 500),
    [findItemsInSelection],
  );

  return (
    <div className={`wrap-main-result loading`} ref={refBoxResult}>
      <>
        {/* TODO: Mobile - Modal detail item  */}
        <DefaultModal
          openModal={isOpenModalImage}
          handleClose={(e: any) => {
            setOpenModalImage(false);
          }}
        >
          <DetailItem
            handlerCloseModal={() => {
              setOpenModalImage(false);
            }}
            onPrevItem={onPrevItem}
            onNextItem={onNextItem}
            dataItem={dataImageModal}
            results={dataResult}
            onHandlerModalShare={() => setOpenModalShare(true)}
            onSearchImage={(url: string) => {
              dispatch(updateStatusLoading(true));
              getUrlToCanvasFile(url);
            }}
          />
        </DefaultModal>

        <Configure filters={filtersString}></Configure>
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
                        <ArrowBackIosOutlinedIcon style={{ fontSize: 20 }} />
                      )}
                    </Button>
                  </Box>
                  {settings.preview && requestImage && (
                    <Box className="col-left">
                      <Box className="box-preview">
                        <Box className="preview-item">
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
                  <Box className="col-left__bottom">
                    <ExpandablePanelComponent />
                  </Box>
                </Box>
              )}

              <Box
                className={`col-right ${
                  settings.preview && 'ml-auto mr-auto'
                } ${isMobile && 'col-right-result-mobile'}`}
              >
                <Box
                  className="wrap-box-refinements"
                  style={{ marginBottom: 10 }}
                >
                  <CurrentRefinements statusSwitchButton={true} />
                </Box>
                {isMobile && settings.preview && requestImage && (
                  <Box className="col-left">
                    <Box className="box-preview">
                      {requestImage && (
                        <Box className="preview-item">
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
                      )}
                    </Box>
                  </Box>
                )}
                <Box
                  className={`box-item-result ${
                    requestImage ? 'ml-auto mr-auto' : 'ml-auto mr-auto'
                  }`}
                >
                  <LoadingScreenCustom
                    handlerToggleModal={handlerToggleModal}
                    setOpenModalShare={setOpenModalShare}
                    getUrlToCanvasFile={getUrlToCanvasFile}
                    setLoading={false}
                    sendFeedBackAction={sendFeedBackAction}
                    moreInfoText={moreInfoText}
                  />
                  <Box
                    className="pagination-result"
                    style={{
                      width: '100%',
                      margin: '20px auto',
                      padding: '0 20%',
                    }}
                  >
                    {props.allSearchResults?.hits.length > 0 && (
                      <Pagination
                        showFirst={false}
                        translations={{
                          previous: (
                            <ArrowLeftIcon style={{ color: '#161616' }} />
                          ),
                          next: <ArrowRightIcon style={{ color: '#161616' }} />,
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
          {/* TODO: Component modal share */}
          <DefaultModal
            openModal={isOpenModalShare}
            handleClose={() => setOpenModalShare(false)}
          >
            <Box className="box-modal-default box-modal-share">
              <Box
                className="ml-auto"
                style={{ width: 'fit-content', marginRight: 5 }}
              >
                <Button
                  style={{ padding: 0 }}
                  onClick={() => setOpenModalShare(false)}
                >
                  <CloseOutlinedIcon
                    style={{ fontSize: 12, color: '#55566B' }}
                  />
                </Button>
              </Box>
              <Box className="box-content-box-share">
                <Typography className="text-f12 text-gray text-bold">
                  Share
                </Typography>
                <Paper component="form" className="box-input">
                  <InputBase
                    className="text-f9 text-gray"
                    style={{ width: '100%' }}
                    value={'https://www.go...'}
                  />
                  <IconButton
                    color="secondary"
                    aria-label="directions"
                    style={{ padding: 0 }}
                  >
                    <FileCopyOutlinedIcon style={{ fontSize: 8 }} />
                  </IconButton>
                </Paper>

                <Box
                  mt={1}
                  className="box-media-share"
                  display={'flex'}
                  style={{ height: '100%' }}
                >
                  <Button style={{ padding: 0 }}>
                    <Box display={'flex'} alignItems={'center'}>
                      <img
                        width={40}
                        height={40}
                        src={IconEmail}
                        alt="icon_email"
                      />
                    </Box>
                  </Button>
                  <Button style={{ padding: 0, margin: '0 20px' }}>
                    <Box display={'flex'} alignItems={'center'}>
                      <img
                        src={IconWeChat}
                        width={40}
                        height={40}
                        alt="icon_email"
                      />
                    </Box>
                  </Button>
                  <Button style={{ padding: 0 }}>
                    <Box display={'flex'} alignItems={'center'}>
                      <img
                        src={IconWhatsApp}
                        width={40}
                        height={40}
                        alt="icon_email"
                      />
                    </Box>
                  </Button>
                </Box>
              </Box>
            </Box>
          </DefaultModal>
        </Box>

        {/* TODO: Component modal image */}
        {!isMobile && (
          <DefaultModal
            openModal={isOpenModalImage}
            handleClose={(e: any) => {
              setOpenModalImage(false);
            }}
          >
            <DetailItem
              handlerCloseModal={() => {
                setOpenModalImage(false);
              }}
              onPrevItem={onPrevItem}
              onNextItem={onNextItem}
              dataItem={dataImageModal}
              results={dataResult}
              onHandlerModalShare={() => setOpenModalShare(true)}
              onSearchImage={(url: string) => {
                dispatch(updateStatusLoading(true));
                getUrlToCanvasFile(url);
              }}
            />
          </DefaultModal>
        )}
      </>
    </div>
  );
}
export default connectStateResults<Props>(memo(ResultComponent));
