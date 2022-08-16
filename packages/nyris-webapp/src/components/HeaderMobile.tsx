import { Box, Button, Drawer } from "@material-ui/core";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import CustomSearchBox from "./input/inputSearch";
import AutocompleteBasicComponent from "./auto-complete/basic";
import { useMediaQuery } from "react-responsive";
import IconFilter from "common/assets/icons/filter_settings.svg";
import { useAppDispatch } from "Store/Store";
import { reset } from "Store/Search";
import IconBack from "common/assets/images/back_arrow.svg";
import { useHistory } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import AutocompleteBasicMobileComponent from "./auto-complete/basic";
interface Props {
  onToggleFilterMobile?: any;
}

function HeaderMobile(props: Props): JSX.Element {
  const { onToggleFilterMobile } = props;
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const history = useHistory();

  return (
    <Box className="wrap-header-mobile">
      {!isMobile ? (
        <CustomSearchBox onToggleFilterMobile={onToggleFilterMobile} />
      ) : (
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
          <Box className="box-button-input-mobile">
            
            <Button
              className="btn-mobile-filter"
              onClick={onToggleFilterMobile}
            >
              <img src={IconFilter} alt="" width={18} height={18} />
            </Button>
          </Box>
        </div>
      )}
    </Box>
  );
}

export default memo(HeaderMobile);
