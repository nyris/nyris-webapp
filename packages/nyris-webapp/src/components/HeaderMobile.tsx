import { Box, Button } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import CustomSearchBox from "./input/inputSearch";
import { useMediaQuery } from "react-responsive";
import IconFilter from "common/assets/icons/filter_settings.svg";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { reset } from "Store/Search";
import { useHistory } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import AutocompleteBasicMobileComponent from "./auto-complete/basic";
// import $ from "jquery";
interface Props {
  onToggleFilterMobile?: any;
}

function HeaderMobile(props: Props): JSX.Element {
  const { onToggleFilterMobile } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector((state) => state);
  const { search } = stateGlobal;
  const { imageThumbSearchInput } = search;
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const [isShowInputSearch, setShowInputSearch] = useState<boolean>(false);
  const [isShowFilter, setShowFilter] = useState<boolean>(false);
  const history = useHistory();

  // useEffect(() => {
  //   if (imageThumbSearchInput && history.location?.pathname === "/result") {
  //     setTimeout(() => {
  //       $(".aa-DetachedSearchButtonIcon").addClass("d-none");
  //     }, 100);
  //   }
  // });

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

  return (
    <Box className="wrap-header-mobile">
      {!isMobile ? (
        <CustomSearchBox onToggleFilterMobile={onToggleFilterMobile} />
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          {imageThumbSearchInput && (
            <div className="box-image-search-thumb-mobile">
              <img src={imageThumbSearchInput} alt="img_search" />
              <button onClick={() => dispatch(reset(""))}>
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
                {history.location?.pathname !== "/" && (
                  <Box
                    className="btn-close-header"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <button
                      onClick={() => {
                        dispatch(reset(""));
                        history.push("/");
                      }}
                      style={{
                        backgroundColor: "#fff",
                        border: 0,
                        padding: "0px 0px 0 16px",
                        display: "flex",
                      }}
                    >
                      <CloseIcon style={{ fontSize: 20, color: "#3e36dc" }} />
                    </button>
                  </Box>
                )}

                <AutocompleteBasicMobileComponent
                  containerRefInputMobile={containerRefInputMobile}
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

export default HeaderMobile;
