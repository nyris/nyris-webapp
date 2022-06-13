import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import IconWhatsApp from "common/assets/icons/icon_whatapps.svg";
import IconEmail from "common/assets/icons/email_share.svg";
import IconWeChat from "common/assets/icons/icon_chat.svg";
import IconSupport from "common/assets/icons/support3.svg";

import { useAppDispatch, useAppSelector } from "Store/Store";
import { debounce } from "lodash";
import KeyboardArrowRightOutlinedIcon from "@material-ui/icons/KeyboardArrowRightOutlined";
import KeyboardArrowLeftOutlinedIcon from "@material-ui/icons/KeyboardArrowLeftOutlined";
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
} from "Store/Search";
import { showFeedback, showResults } from "Store/Nyris";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Configure, HitsPerPage } from "react-instantsearch-dom";
import CustomSearchBox from "components/input/inputSearch";
import {
  feedbackClickEpic,
  feedbackSuccessEpic,
  feedbackTextSearchEpic,
} from "services/Feedback";
import { createImage, findByImage, findRegions } from "services/image";
import { AlgoliaResult, AlgoliaSettings } from "../../types";
import LoadingScreenCustom from "components/LoadingScreen";
import { Preview } from "@nyris/nyris-react-components";
import { showHits } from "./MockData";
import { Link } from "react-router-dom";
import ExpandablePanelComponent from "components/PanelResult";
import { CurrentRefinements } from "components/current-refinements/current-refinements";

interface Props {}

const defaultSelection = { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 };

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector((state) => state);
  const [showColLeft, setToggleShowColLeft] = useState<boolean>(false);
  const [showImageCanvas, setShowImageCanvas] = useState<boolean>(true);
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [numberResult, setNumberResult] = useState<number>(0);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const { search, settings } = stateGlobal;
  const { results, requestImage, regions, selectedRegion } = search;
  const moreInfoText = settings?.themePage?.searchSuite?.moreInfoText;
  const { valueTextSearch } = search;
  const [dataResult, setDataResult] = useState<any[]>([]);
  const [dataImageModal, setDataImageModal] = useState<any>();
  const [searchStateInput, setSearchStateInput] = useState<any>({});
  const [isLoading, setLoading] = useState<any>(false);
  // const [collapsePanel, setCollapsePanel] = useState<boolean>(true);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const index = searchClient.initIndex(indexName);
  // TODO: data algolia search to api
  useEffect(() => {
    if (!valueTextSearch) {
      return;
    }
    setSearchStateInput(valueTextSearch);
  }, [valueTextSearch]);

  useEffect(() => {
    if (results?.length === 0) {
      setDataResult([]);
      return;
    }
    setDataResult(results);
  }, [results]);

  useEffect(() => {
    if (!showColLeft) {
      return setShowImageCanvas(true);
    }
    return setShowImageCanvas(false);
  }, [showColLeft]);

  // TODO: hanlder modal:
  const handlerToggleModal = (item: any) => {
    setDataImageModal(item);
    return setOpenModalImage(true);
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

  const debounceRectCoords = (value: any) => handlerRectCoords(value);

  const handlerRectCoords = debounce((value: any) => {
    dispatch(selectionChanged(value));
    setLoading(true);
    return findItemsInSelection(value);
  }, 500);

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

  // TODO: Search text
  const searchTextByApiAndFilter = async (searchState: any) => {
    try {
      if (searchState?.query !== "") {
        const data = await index.search<AlgoliaResult>(searchState.query, {});
        const productIds = data.hits.map((hit) => hit.sku);
        await feedbackTextSearchEpic(
          stateGlobal,
          data.query,
          data.page,
          productIds
        );
      }
    } catch (error) {
      console.log("searchTextByApi", error);
      return;
    }
  };

  // TODO: Handler like dislike
  const sendFeedBackAction = async (type: string) => {
    feedbackSuccessEpic(stateGlobal, type === "like");
  };

  // TODO: Search image with url or file
  const getUrlToCanvasFile = async (url: string, position?: number) => {
    dispatch(showResults());
    dispatch(loadingActionResults());
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
    <Box className={`wrap-main-result loading`}>
      <>
        {isLoading && (
          <Box className="box-wrap-loading">
            <Box className="loadingSpinCT">
              <Box className="box-content-spin"></Box>
            </Box>
          </Box>
        )}
        <InstantSearch
          indexName={indexName}
          searchClient={searchClient}
          searchState={searchStateInput}
          onSearchStateChange={(state) => {
            setSearchStateInput(state);
            searchTextByApiAndFilter(state);
          }}
        >
          <Configure filters={filtersString}></Configure>

          <Box className="box-wrap-result-component">
            <div className="box-search">
              <Box>
                <CustomSearchBox />
              </Box>
              {/* <Box className="box-filter">
                  <FilterComponent />
                </Box> */}
            </div>
            <Box className="box-result">
              <>
                <Box className="btn-open-support">
                  <Link to={"/support"} style={{ color: "#3E36DC" }}>
                    <img src={IconSupport} alt="" width={16} height={16} />
                  </Link>
                </Box>
                <Box className="wrap-main-col-left">
                  {settings.preview && requestImage && (
                    <Box className={`col-left ${showColLeft && "toggle"}`}>
                      <Box className="box-preview">
                        <Button
                          className="button-toggle"
                          onClick={() => {
                            setTimeout(() => {
                              setToggleShowColLeft(!showColLeft);
                            }, 500);
                          }}
                        >
                          {showColLeft ? (
                            <KeyboardArrowRightOutlinedIcon />
                          ) : (
                            <KeyboardArrowLeftOutlinedIcon />
                          )}
                        </Button>
                        {requestImage && showImageCanvas && (
                          <Box className="preview-item">
                            <Preview
                              key={requestImage?.id}
                              onSelectionChange={(r: RectCoords) => {
                                debounceRectCoords(r);
                                return;
                              }}
                              image={requestImage?.canvas}
                              selection={selectedRegion || defaultSelection}
                              regions={regions}
                              maxWidth={400}
                              maxHeight={500}
                              dotColor="#FBD914"
                            />
                          </Box>
                        )}
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
                    <ExpandablePanelComponent />
                  </Box>
                </Box>

                <Box
                  className={`col-right ${
                    settings.preview && "ml-auto mr-auto"
                  }`}
                >
                  <Box className="wrap-box-refinements">
                    <CurrentRefinements />
                  </Box>
                  <Box
                    className={`box-item-result ${
                      requestImage && showImageCanvas
                        ? "mr-auto"
                        : "ml-auto mr-auto"
                    }`}
                  >
                    <LoadingScreenCustom
                      handlerToggleModal={handlerToggleModal}
                      setOpenModalShare={setOpenModalShare}
                      setSearchStateInput={setSearchStateInput}
                      getUrlToCanvasFile={getUrlToCanvasFile}
                      setLoading={setLoading}
                      sendFeedBackAction={sendFeedBackAction}
                      moreInfoText={moreInfoText}
                    />
                  </Box>
                </Box>
              </>
            </Box>
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
        </InstantSearch>

        {/* TODO: Component modal image */}
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
      </>
    </Box>
  );
}

export default ResultComponent;
