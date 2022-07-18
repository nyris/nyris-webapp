import React, { useEffect, useRef, useState } from "react";
import { Button, Box } from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { connectSearchBox } from "react-instantsearch-dom";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { reset } from "Store/Search";
import { debounce } from "lodash";
import { useCallback } from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconSearch from "common/assets/icons/icon_search.svg";

const SearchBox = ({ currentRefinement, refine }: any) => {
  const stateGlobal = useAppSelector((state) => state);
  const { search } = stateGlobal;
  const { imageThumbSearchInput } = search;
  const focusInp: any = useRef();
  const history = useHistory();
  const [, setShowBtnClear] = useState<boolean>(true);
  const [valueInput, setValueInput] = useState<string>("");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (focusInp?.current) {
      focusInp?.current.focus();
    }
  }, [focusInp]);

  useEffect(() => {
    // if (currentRefinement) {
    setValueInput(currentRefinement);
    // }
  }, [currentRefinement]);

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

  return (
    <Box className="wrap-input-search">
      <Box p={2} display={"flex"} className="box-input-search">
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
              style={{ border: "0px", width: "100%", fontSize: 14, color:'#2B2C46' }}
              className="input-search"
              placeholder="Search"
              value={valueInput}
              onChange={(event) => {
                setValueInput(event.currentTarget.value);
                debounceSearch(event.currentTarget.value);
              }}
              ref={focusInp}
            />
            <Box className="icon-search">
              <img src={IconSearch} alt="" width={24} height={24} />
            </Box>
            {/* <SearchRoundedIcon
              className="icon-search"
              style={{ color: "#55566B", fontSize: "20px" }}
            /> */}
          </Box>
          {history.location.pathname === "/result" && (
            <Button
              className="btn-clear-text"
              onClick={() => {
                setValueInput("");
                refine("");
                dispatch(reset(""));
                history.push("/");
                return;
              }}
            >
              <ClearOutlinedIcon style={{ fontSize: 12, color: "#2B2C46" }} />
            </Button>
          )}
        </form>
      </Box>
    </Box>
  );
};

const CustomSearchBox = connectSearchBox(SearchBox);
export default CustomSearchBox;
