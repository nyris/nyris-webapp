import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import IconWhatsApp from "common/assets/icons/Icon_whatsapp.png";
import IconEmail from "common/assets/icons/icon_email.png";
import IconWeChat from "common/assets/icons/Icon_wechat.png";
// import FilterComponent from "components/FilterComponent";
// import {
//   dataFieldFive,
//   dataFieldFour,
//   dataFieldOne,
//   dataFieldSix,
//   dataFieldThree,
//   dataFieldTow,
// } from "./MockData";
import ItemResult from "components/results/ItemResult";
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
  loadFile,
  loadingActionResults,
  searchFileImageNonRegion,
  selectionChanged,
  updateResultChangePosition,
} from "Store/Search";
import { showFeedback, showResults } from "Store/Nyris";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Hits,
  Pagination,
  Configure,
} from "react-instantsearch-dom";
import CustomSearchBox from "components/input/inputSearch";
import { feedbackClickEpic } from "services/Feedback";
import {
  searchImageByPosition,
  serviceImage,
  serviceImageNonRegion,
} from "services/image";
import Preview from "components/preview/preview";
import NyrisAPI from "@nyris/nyris-api";
import LoadingScreenCustom from "components/LoadingScreen";

interface Props {}

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const StateGlobal = useAppSelector((state) => state);
  const [showColLeft, setToggleShowColLeft] = useState<boolean>(false);
  const [showImageCanvas, setShowImageCanvas] = useState<boolean>(true);
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [numberResult, setNumberResult] = useState<number>(0);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const { search, settings }: any = StateGlobal;
  const { results, requestImage, regions, selectedRegion }: any = search;
  const { valueTextSearch } = search;
  const [dataResult, setDataResult] = useState<any[]>([]);
  const [dataImageModal, setDataImageModal] = useState<any>();
  const [searchStateInput, setSearchStateInput] = useState<any>({});
  const apiNyris = new NyrisAPI(settings);
  const [isLoading, setLoading] = useState<any>(false);
  const { apiKeyAlgolia, appIdAlgolia, indexNameAlgolia } = settings;
  const searchClient = algoliasearch(appIdAlgolia, apiKeyAlgolia);
  const index = searchClient.initIndex(indexNameAlgolia);

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
    return onSearchOffersForImage(value);
  }, 500);

  // TODO: Search offers for image:
  const onSearchOffersForImage = (r: RectCoords) => {
    if (!requestImage) {
      return;
    }
    const { canvas }: any = requestImage;
    if (settings.regions) {
      searchImageByPosition(canvas, StateGlobal, r).then((res: any) => {
        const payload = {
          ...res,
          requestImage: requestImage,
        };
        dispatch(updateResultChangePosition(payload));
        setLoading(false);
        return dispatch(showFeedback(""));
      });
    } else {
      serviceImageNonRegion(canvas, StateGlobal, null).then((res: any) => {
        const payload = {
          ...res,
          requestImage: requestImage,
        };
        dispatch(updateResultChangePosition(payload));
        return dispatch(showFeedback(""));
      });
    }
  };

  // TODO: Search text
  const searchTextByApiAndFilter = async (searchState: any) => {
    try {
      if (searchState?.query !== "") {
        const data = await index.search(searchState.query, {});
        const productIds = data.hits.map((hit: any) => hit.sku);
        const eventData = {
          query: data.query,
          page: data.page,
          product_ids: productIds,
        };
        const textSearchEvent: any = { event: "text-search", data: eventData };
        await apiNyris.sendFeedback(
          search?.sessionId,
          search?.requestId,
          textSearchEvent
        );
      }
    } catch (error: any) {
      console.log("searchTextByApi", error);
      return;
    }
  };

  // TODO: Handler like dislike
  const sendFeedBackAction = async (type: string) => {
    try {
      const action = type === "like" ? true : false;
      const payload: any = {
        event: "feedback",
        data: {
          success: action,
        },
      };
      await apiNyris.sendFeedback(
        search?.sessionId,
        search?.requestId,
        payload
      );
    } catch (error) {}
  };

  // Search image with url or file
  const getUrlToCanvasFile = (url: string, position?: number) => {
    dispatch(showResults(""));
    dispatch(loadingActionResults(""));
    if (position) {
      feedbackClickEpic(StateGlobal, position);
      return;
    }
    if (settings.regions) {
      serviceImage(url, StateGlobal).then((res: any) => {
        dispatch(loadFile(res));
        setLoading(false);
        return dispatch(showFeedback(""));
      });

      return;
    } else {
      serviceImageNonRegion(url, StateGlobal, undefined).then((res) => {
        dispatch(searchFileImageNonRegion(res));
      });
      return;
    }
  };

  // Todo: item result.
  const Hit = (hit: any) => {
    return (
      <ItemResult
        dataItem={hit?.hit}
        handlerToggleModal={() => {
          handlerToggleModal(hit?.hit);
        }}
        handlerToggleModalShare={() => setOpenModalShare(true)}
        indexItem={hit.__position}
        isHover={false}
        onSearchImage={(url: any) => {
          setSearchStateInput({});
          getUrlToCanvasFile(url);
          setLoading(true);
        }}
        handlerFeedback={(value: string) => {
          sendFeedBackAction(value);
        }}
      />
    );
  };

  const nonEmptyFilter: any[] = !search?.requestImage
    ? []
    : ["sku:DOES_NOT_EXIST<score=1>"];
  const filterSkus: any = search?.results
    ? search?.results.map(
        (f: any) => `sku:'${f.sku}'<score=${Math.round(100 * f.score)}>`
      )
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
          indexName={indexNameAlgolia}
          searchClient={searchClient}
          searchState={searchStateInput}
          onSearchStateChange={(state: any) => {
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
                            initialRegion={
                              !selectedRegion
                                ? regions[0]
                                  ? regions[0]
                                  : { x1: 0, x2: 1, y1: 0, y2: 1 }
                                : selectedRegion
                            }
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

                <Box
                  className={`col-right ${
                    settings.preview && "ml-auto mr-auto"
                  }`}
                >
                  <Box
                    className={`box-item-result ${
                      requestImage && showImageCanvas
                        ? "mr-auto"
                        : "ml-auto mr-auto"
                    }`}
                  >
                    <LoadingScreenCustom>
                      <Hits hitComponent={Hit} />
                    </LoadingScreenCustom>
                  </Box>
                </Box>
              </>
            </Box>
            <Box>
              <Box className="box-panigation">
                <Pagination />
              </Box>
              <Box className="box-notify">
                <FooterResult search={search} />
              </Box>
            </Box>

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

                  <Box mt={1} className="box-media-share">
                    <Button style={{ padding: 0 }}>
                      <Box display={"flex"} alignItems={"center"}>
                        <img src={IconEmail} alt="icon_email" />
                        <Typography
                          className="text-f8 fw-500"
                          style={{ color: "#2B2C46", marginLeft: 5 }}
                        >
                          Share with e-Mail
                        </Typography>
                      </Box>
                    </Button>
                    <Button style={{ padding: 0 }}>
                      <Box display={"flex"} alignItems={"center"}>
                        <img src={IconWhatsApp} alt="icon_email" />
                        <Typography
                          className="text-f8 fw-500"
                          style={{ color: "#2B2C46", marginLeft: 5 }}
                        >
                          Share with WhatsApp
                        </Typography>
                      </Box>
                    </Button>
                    <Button style={{ padding: 0 }}>
                      <Box display={"flex"} alignItems={"center"}>
                        <img src={IconWeChat} alt="icon_email" />
                        <Typography
                          className="text-f8 fw-500"
                          style={{ color: "#2B2C46", marginLeft: 5 }}
                        >
                          Share with WeChat
                        </Typography>
                      </Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </DefaultModal>
          </Box>
        </InstantSearch>
      </>
    </Box>
  );
}

export default ResultComponent;