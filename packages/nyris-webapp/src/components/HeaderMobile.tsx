import { Box, Button } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import CustomSearchBox from "./input/inputSearch";
import { useMediaQuery } from "react-responsive";
import IconFilter from "common/assets/icons/filter_settings.svg";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { onResetRequestImage, reset, setImageSearchInput } from "Store/Search";
import { useHistory } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import AutocompleteBasicMobileComponent from "./auto-complete/basic";
// import $ from "jquery";
interface Props {
  onToggleFilterMobile?: any;
  refine?: any;
}

function HeaderMobile(props: Props): JSX.Element {
  const { onToggleFilterMobile, refine } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector((state) => state);
  const { search } = stateGlobal;
  const { imageThumbSearchInput, textSearchInputMobile } = search;
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const [isShowInputSearch, setShowInputSearch] = useState<boolean>(false);
  const [isShowFilter, setShowFilter] = useState<boolean>(false);
  const [isResetImage, setResetImage] = useState<boolean>(false);
  const history = useHistory();

  useEffect(() => {
    if (history.location?.pathname === "/result") {
      setShowFilter(true);
    } else {
      setShowFilter(false);
    }
  }, [history.location]);

  useEffect(() => {
    if (
      history.location?.pathname === "/result" ||
      history.location?.pathname === "/"
    ) {
      setShowInputSearch(true);
    } else {
      setShowInputSearch(false);
    }
  }, [history.location]);
  console.log("textSearchInputMobile", textSearchInputMobile);

  return (
    <Box className="wrap-header-mobile">
      {!isMobile ? (
        <CustomSearchBox onToggleFilterMobile={onToggleFilterMobile} />
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          {imageThumbSearchInput && (
            <div className="box-image-search-thumb-mobile">
              <img src={imageThumbSearchInput} alt="img_search" />
              <button
                onClick={() => {
                  if (textSearchInputMobile) {
                    dispatch(setImageSearchInput(""));
                    dispatch(onResetRequestImage(""));
                    setResetImage(true);
                    setTimeout(() => {
                      setResetImage(false);
                    }, 1000);
                    return;
                  }
                  dispatch(reset(""));
                  history.push("/");
                }}
              >
                <CloseIcon
                  style={{ fontSize: 20, color: "#3e36dc", fontWeight: 700 }}
                />
              </button>
            </div>
          )}
          {isShowInputSearch && (
            <>
              <div
                ref={containerRefInputMobile}
                id="box-input-search"
                className="d-flex w-100"
                style={{ alignItems: "center" }}
              >
                <AutocompleteBasicMobileComponent
                  containerRefInputMobile={containerRefInputMobile}
                  isiImageThumbSearchInput={
                    imageThumbSearchInput ? true : false
                  }
                  isResetImage={isResetImage}
                />

                {isShowFilter && (
                  <Box className="box-button-input-mobile">
                    <Button
                      className="btn-mobile-filter"
                      onClick={onToggleFilterMobile}
                    >
                      <img src={IconFilter} alt="" width={18} height={18} />
                    </Button>
                  </Box>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Box>
  );
}

// export default HeaderMobile;

// const HeaderMobile = connectSearchBox<any>(memo(Header));
export default HeaderMobile;
