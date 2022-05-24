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
  setSearchResults,
  loadingActionResults,
  selectionChanged,
  updateResultChangePosition, setRegions, setSelectedRegion,
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
import {feedbackClickEpic, feedbackSuccessEpic, feedbackTextSearchEpic} from "services/Feedback";
import {
  createImage, findByImage, findRegions,
} from "services/image";
import LoadingScreenCustom from "components/LoadingScreen";
import { Preview } from "@nyris/nyris-react-components";
import {AlgoliaResult, AlgoliaSettings} from "../../types";

interface Props {}

function ResultComponent(props: Props) {
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector((state) => state);
  const [showColLeft, setToggleShowColLeft] = useState<boolean>(false);
  const [showImageCanvas, setShowImageCanvas] = useState<boolean>(true);
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [numberResult, setNumberResult] = useState<number>(0);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const { search, settings } = stateGlobal;
  const { results, requestImage, regions, selectedRegion }: any = search;
  const { valueTextSearch } = search;
  const [dataResult, setDataResult] = useState<any[]>([]);
  const [dataImageModal, setDataImageModal] = useState<any>();
  const [searchStateInput, setSearchStateInput] = useState<any>({});
  const [isLoading, setLoading] = useState<any>(false);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const index = searchClient.initIndex(indexName);

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
    findByImage(canvas, stateGlobal.settings, r).then((res) => {
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
        await feedbackTextSearchEpic(stateGlobal, data.query, data.page, productIds);
      }
    } catch (error) {
      console.log("searchTextByApi", error);
      return;
    }
  };

  const sendFeedBackAction = async (type: string) =>
    feedbackSuccessEpic(stateGlobal, type === "like");

  // Search image with url or file
  const getUrlToCanvasFile = async (url: string, position?: number) => {
    dispatch(showResults());
    dispatch(loadingActionResults());
    let image = await createImage(url);
    if (position) {
      feedbackClickEpic(stateGlobal, position);
      return;
    }
    let searchRegion : RectCoords | undefined = undefined;
    if (settings.regions) {
      let res = await findRegions(image, settings);
      searchRegion = res.selectedRegion;
      dispatch(setRegions(res.regions));
      dispatch(setSelectedRegion(searchRegion));
    }

    findByImage(image, settings, searchRegion).then((res ) => {
      dispatch(setSearchResults(res));
      setLoading(false);
      return dispatch(showFeedback());
    });
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

  const nonEmptyFilter: any[] = !requestImage
    ? []
    : ["sku:DOES_NOT_EXIST<score=1>"];
  const filterSkus: any = search?.results
      ? search?.results.slice().reverse().map(
          (f: any, i: number) => `sku:'${f.sku}'<score=${i}>`
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
                            selection={selectedRegion}
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
