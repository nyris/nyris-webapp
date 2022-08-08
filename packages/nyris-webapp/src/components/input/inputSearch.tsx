import React, { memo, useEffect, useRef, useState } from "react";
import { Button, Box } from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { connectSearchBox } from "react-instantsearch-dom";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "Store/Store";
import {
  reset,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
} from "Store/Search";
import { debounce, isEmpty } from "lodash";
import { useCallback } from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconSearch from "common/assets/icons/icon_search.svg";
import IconButton from "@material-ui/core/IconButton";
import { useDropzone } from "react-dropzone";
import { createImage, findByImage } from "services/image";
import IconCamera from "common/assets/icons/camera.svg";
import IconFilter from "common/assets/icons/filter_settings.svg";
import { useMediaQuery } from "react-responsive";

const SearchBox = (props: any) => {
  const {
    currentRefinement,
    refine,
    onToggleFilterMobile,
    // onGetRefInputSearchMobile,
  }: any = props;
  // const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const stateGlobal = useAppSelector((state) => state);
  const { search, settings } = stateGlobal;
  const { imageThumbSearchInput, valueTextSearch } = search;
  const focusInp: any = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const [, setShowBtnClear] = useState<boolean>(true);
  const [valueInput, setValueInput] = useState<string>("");
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });

  useEffect(() => {
    if (focusInp?.current) {
      focusInp?.current.focus();
    }
  }, [focusInp]);

  useEffect(() => {
    if (!isEmpty(valueTextSearch?.query)) {
      setValueInput(valueTextSearch.query);
    }
    setValueInput(currentRefinement);
  }, [currentRefinement, valueTextSearch]);

  useEffect(() => {
    if (valueInput.length > 0) {
      setShowBtnClear(true);
    }
    setShowBtnClear(false);
  }, [valueInput]);

  const debounceSearch = useCallback(
    debounce((nextValue: any) => refine(nextValue), 0),
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[]) => {
      // onChangeLoading(true);
      console.log("321");
      let payload: any;
      let filters: any[] = [];
      // setLoadingLoadFile(true);
      console.log("fs", fs);
      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      // TODO support regions
      return findByImage(image, settings).then((res: any) => {
        res?.results.map((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        payload = {
          ...res,
          filters,
        };
        console.log("payload", payload);
        dispatch(setSearchResults(payload));
        // history.push("/result");
        // return dispatch(showFeedback());
      });
    },
  });

  return (
    <Box className="wrap-input-search">
      <div
        style={{ padding: 10 }}
        className="box-input-search d-flex"
      
        
      >
        <form noValidate action="" role="search">
          <Box className="box-inp">
            <Box
              style={
                imageThumbSearchInput
                  ? { paddingLeft: 0, height: "100%" }
                  : { paddingLeft: 10, height: "100%" }
              }
            >
              {imageThumbSearchInput && (
                <Box className="box-image-search-thumb" display={"flex"}>
                  <img src={imageThumbSearchInput} alt="img_search" />
                  <button onClick={() => dispatch(reset(""))}>
                    <CloseIcon style={{ fontSize: 20, color: "#3e36dc" }} />
                  </button>
                </Box>
              )}
            </Box>

            <input
              style={{
                border: "0px",
                width: "100%",
                fontSize: 14,
                color: "#2B2C46",
              }}
              className="input-search"
              placeholder="Search"
              value={valueInput}
              onChange={(event) => {
                setValueInput(event.currentTarget.value);
                debounceSearch(event.currentTarget.value);
                if (history.location.pathname !== "/result") {
                  history.push("/result");
                }
              }}
              ref={focusInp}
            />
            <Box className="icon-search">
              <img src={IconSearch} alt="" width={24} height={24} />
            </Box>
          </Box>
          {history.location.pathname === "/result" && (
            <Button
              className="btn-clear-text"
              onClick={() => {
                setValueInput("");
                refine("");
                dispatch(reset(""));
                history.push("/");
              }}
            >
              <ClearOutlinedIcon style={{ fontSize: 12, color: "#2B2C46" }} />
            </Button>
          )}
          {!isMobile ? (
            <div className="wrap-box-input-mobile">
              <input
                accept="image/*"
                id="icon-button-file"
                type="file"
                style={{ display: "none" }}
                {...getInputProps({
                  onClick: (e) => {
                    e.stopPropagation();
                  },
                })}
              />
              <label htmlFor="icon-button-file">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "100%",
                    padding: 7,
                    backgroundColor: "#F3F3F5",
                  }}
                >
                  <img src={IconCamera} alt="" width={18} height={18} />
                </IconButton>
              </label>
            </div>
          ) : (
            <Box>
              <Button
                className="btn-mobile-filter"
                onClick={onToggleFilterMobile}
              >
                <img src={IconFilter} alt="" width={18} height={18} />
              </Button>
            </Box>
          )}
        </form>
      </div>
    </Box>
  );
};

const CustomSearchBox = connectSearchBox<any>(memo(SearchBox));
export default CustomSearchBox;
