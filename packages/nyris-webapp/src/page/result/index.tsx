import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@material-ui/core";
import IconWhatsApp from "common/assets/icons/icon_whatapps.svg";
import IconEmail from "common/assets/icons/email_share.svg";
import IconWeChat from "common/assets/icons/icon_chat.svg";
import IconSupport from "common/assets/icons/support3.svg";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { debounce } from "lodash";
import KeyboardArrowRightOutlinedIcon from "@material-ui/icons/KeyboardArrowRightOutlined";
import FooterResult from "components/FooterResult";
import DefaultModal from "components/modal/DefaultModal";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import DetailItem from "components/DetailItem";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import { RectCoords } from "@nyris/nyris-api";
import {
  setSearchResults,
  loadingActionResults,
  selectionChanged,
  updateResultChangePosition,
  setRegions,
  setSelectedRegion,
  setRequestImage,
  setImageSearchInput,
  reset,
} from "Store/Search";
import { showFeedback, showResults } from "Store/Nyris";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Configure,
  HitsPerPage,
  Pagination,
} from "react-instantsearch-dom";
import CustomSearchBox from "components/input/inputSearch";
import { feedbackClickEpic, feedbackSuccessEpic } from "services/Feedback";
import { createImage, findByImage, findRegions } from "services/image";
import { AlgoliaSettings } from "../../types";
import LoadingScreenCustom from "components/LoadingScreen";
import { Preview } from "@nyris/nyris-react-components";
import { showHits } from "./MockData";
import { Link } from "react-router-dom";
import ExpandablePanelComponent from "components/PanelResult";
import { CurrentRefinements } from "components/current-refinements/current-refinements";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowBackIosOutlinedIcon from "@material-ui/icons/ArrowBackIosOutlined";
import { useMediaQuery } from "react-responsive";
import { scroller } from "react-scroll";

interface Props {}

const defaultSelection = { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 };

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const refBoxResult = useRef(null);
  const stateGlobal = useAppSelector((state) => state);
  const { search, settings } = stateGlobal;
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [numberResult, setNumberResult] = useState<number>(0);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const { results, requestImage, regions, selectedRegion } = search;
  const moreInfoText = settings?.themePage?.searchSuite?.moreInfoText;
  const { valueTextSearch } = search;
  const [dataResult, setDataResult] = useState<any[]>([]);
  const [dataImageModal, setDataImageModal] = useState<any>();
  const [isLoading, setLoading] = useState<any>(false);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const [toggleColLeft, setToggleColLeft] = useState<boolean>(false);
  const [statusSwitchButton, setStatusSwitchButton] = useState<boolean>(true);
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });

  useEffect(() => {
    if (results?.length === 0) {
      setDataResult([]);
      return;
    }
    setDataResult(results);
  }, [results]);

  // TODO: hanlder modal:
  const handlerToggleModal = (item: any) => {
    setLoading(true);
    setDataImageModal(item);
    setOpenModalImage(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    setTimeout(() => {
      setLoading(false);
    }, 400);
    if (isMobile) {
      dispatch(reset(""));
    }
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

  // TODO: rectCoords
  const debounceRectCoords = (value: any) => {
    handlerRectCoords(value);
    dispatch(selectionChanged(value));
  };

  const handlerRectCoords = debounce((value: any) => {
    setLoading(true);
    return findItemsInSelection(value);
  }, 200);

  // TODO: Search offers for image:
  const findItemsInSelection = (r: RectCoords) => {
    if (!requestImage) {
      return;
    }
    const { canvas }: any = requestImage;
    findByImage(canvas, settings, r).then((res) => {
      const payload = {
        ...res,
      };
      dispatch(updateResultChangePosition(payload));
      setLoading(false);
      return dispatch(showFeedback());
    });
  };

  // TODO: Handler like dislike
  const sendFeedBackAction = async (type: string) => {
    feedbackSuccessEpic(stateGlobal, type === "like");
  };

  // TODO: Search image with url or file
  const getUrlToCanvasFile = async (url: string, position?: number) => {
    if (isMobile) {
      setOpenModalImage(false);
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
    findByImage(image, settings, searchRegion).then((res) => {
      dispatch(setSearchResults(res));
      setLoading(false);
      return dispatch(showFeedback());
    });
  };

  const nonEmptyFilter: any[] = !requestImage
    ? []
    : ["sku:DOES_NOT_EXIST<score=1>"];
  const filterSkus: any = search?.results
    ? search?.results
        .slice()
        .reverse()
        .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}>`)
    : "";
  const filtersString = [...nonEmptyFilter, ...filterSkus].join(" OR ");

  return (
    <div className={`wrap-main-result loading`} ref={refBoxResult}>
      <>
        {isLoading && (
          <Box className="box-wrap-loading">
            <Box className="loadingSpinCT">
              <Box className="box-content-spin"></Box>
            </Box>
          </Box>
        )}
        {isMobile && isOpenModalImage && (
          <Box className="box-detail-item-mobile">
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
                setLoading(true);
                getUrlToCanvasFile(url);
              }}
            />
          </Box>
        )}

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
                <Link to={"/support"} style={{ color: "#3E36DC" }}>
                  <img src={IconSupport} alt="" width={16} height={16} />
                </Link>
              </Box>
              {!isMobile && (
                <Box
                  className={`wrap-main-col-left ${
                    toggleColLeft ? "toggle" : ""
                  }`}
                >
                  <Box className="box-toggle-coloumn">
                    <Button
                      style={
                        requestImage && !toggleColLeft
                          ? { color: "#fff" }
                          : { color: "#55566b" }
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
                        {/* {requestImage && ( */}
                        <Box className="preview-item">
                          <Preview
                            key={requestImage?.id}
                            onSelectionChange={(r: RectCoords) => {
                              debounceRectCoords(r);
                            }}
                            image={requestImage?.canvas}
                            selection={selectedRegion || defaultSelection}
                            regions={regions}
                            maxWidth={320}
                            maxHeight={320}
                            dotColor="#FBD914"
                          />
                        </Box>
                        {/* )} */}
                      </Box>
                      <Box className="box-title_col-left">
                        <Typography style={{ fontSize: 11, color: "#fff" }}>
                          Adjust the selection frame for better results.
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {/* TODO: Filter list Choose */}
                  <Box className="col-left__bottom">
                    <ExpandablePanelComponent
                    // onToogleApplyFillter={onToogleApplyFillter}
                    />
                  </Box>
                </Box>
              )}

              <Box
                className={`col-right ${
                  settings.preview && "ml-auto mr-auto"
                } ${isMobile && "col-right-result-mobile"}`}
              >
                <Box className="wrap-box-refinements">
                  <CurrentRefinements statusSwitchButton={statusSwitchButton} />
                </Box>
                {isMobile && settings.preview && requestImage && (
                  <Box className="col-left">
                    <Box className="box-preview">
                      {requestImage && (
                        <Box className="preview-item">
                          <Preview
                            key={requestImage?.id}
                            onSelectionChange={(r: RectCoords) => {
                              debounceRectCoords(r);
                            }}
                            image={requestImage?.canvas}
                            selection={selectedRegion || defaultSelection}
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
                    requestImage ? "ml-auto mr-auto" : "ml-auto mr-auto"
                  }`}
                >
                  <LoadingScreenCustom
                    handlerToggleModal={handlerToggleModal}
                    setOpenModalShare={setOpenModalShare}
                    getUrlToCanvasFile={getUrlToCanvasFile}
                    setLoading={setLoading}
                    sendFeedBackAction={sendFeedBackAction}
                    moreInfoText={moreInfoText}
                  />
                  <Box
                    className="pagination-result"
                    style={{
                      width: "100%",
                      margin: "20px auto",
                      padding: "0 20%",
                    }}
                  >
                    {/* <CustomPagination /> */}
                    <Pagination
                      showFirst={false}
                      translations={{
                        previous: (
                          <ArrowLeftIcon style={{ color: "#161616" }} />
                        ),
                        next: <ArrowRightIcon style={{ color: "#161616" }} />,
                      }}
                    />
                  </Box>
                  {isMobile && (
                    <Box
                      className="box-title_col-left"
                      style={{
                        height: 86,
                        background:
                          "linear-gradient(360deg, #56577C 0%, #2B2C46 100%)",
                        width: "100%",
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          textAlign: "center",
                          marginTop: 18,
                        }}
                      >
                        <span className="fw-700">Wrong results?</span> share
                        your search with our{" "}
                        <span style={{ textDecoration: "underline" }}>
                          <a href="#" className="fw-700 text-white">
                            product experts
                          </a>
                        </span>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          </Box>
          {!isMobile && (
            <Box>
              <Box className="box-notify">
                <FooterResult search={search}>
                  <Box
                    display={"flex"}
                    style={{ padding: "0 20px" }}
                    className="box-change-hit-items"
                  >
                    Items per page:{" "}
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
                style={{ width: "fit-content", marginRight: 5 }}
              >
                <Button
                  style={{ padding: 0 }}
                  onClick={() => setOpenModalShare(false)}
                >
                  <CloseOutlinedIcon
                    style={{ fontSize: 12, color: "#55566B" }}
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
                    style={{ width: "100%" }}
                    value={"https://www.go..."}
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
                  display={"flex"}
                  style={{ height: "100%" }}
                >
                  <Button style={{ padding: 0 }}>
                    <Box display={"flex"} alignItems={"center"}>
                      <img
                        width={40}
                        height={40}
                        src={IconEmail}
                        alt="icon_email"
                      />
                    </Box>
                  </Button>
                  <Button style={{ padding: 0, margin: "0 20px" }}>
                    <Box display={"flex"} alignItems={"center"}>
                      <img
                        src={IconWeChat}
                        width={40}
                        height={40}
                        alt="icon_email"
                      />
                    </Box>
                  </Button>
                  <Button style={{ padding: 0 }}>
                    <Box display={"flex"} alignItems={"center"}>
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
                setLoading(true);
                getUrlToCanvasFile(url);
              }}
            />
          </DefaultModal>
        )}
      </>
    </div>
  );
}

export default ResultComponent;
