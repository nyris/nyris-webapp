import React, { useEffect, useRef, useState } from "react";
import { Button, Box } from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { connectSearchBox } from "react-instantsearch-dom";
import { useHistory } from "react-router-dom";
import { useAppDispatch } from "Store/Store";
import { reset } from "Store/Search";
import { debounce } from "lodash";
import { useCallback } from "react";

const SearchBox = ({ currentRefinement, isSearchStalled, refine }: any) => {
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
          <input
            style={{ border: "0px", width: "100%" }}
            className="input-search"
            value={valueInput}
            onChange={(event) => {
              setValueInput(event.currentTarget.value);
              debounceSearch(event.currentTarget.value);
            }}
            ref={focusInp}
          />
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
