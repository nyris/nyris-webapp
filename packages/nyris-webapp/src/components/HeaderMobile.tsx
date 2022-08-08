import { Box, Button, Drawer } from "@material-ui/core";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import CustomSearchBox from "./input/inputSearch";
import AutocompleteBasicComponent from "./auto-complete/basic";
import { useMediaQuery } from "react-responsive";
import IconFilter from "common/assets/icons/filter_settings.svg";

interface Props {
  onToggleFilterMobile?: any;
}

function HeaderMobile(props: Props): JSX.Element {
  const { onToggleFilterMobile } = props;
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  // const [containerRefInputMobile, setContainerRefInputMobile] = useState(null);
  // const onGetRefInputSearchMobile = (refInput: any) => {
  //   setContainerRefInputMobile(refInput);
  // };

  return (
    <Box className="wrap-header-mobile">
      {!isMobile ? (
        <CustomSearchBox onToggleFilterMobile={onToggleFilterMobile} />
      ) : (
        <div ref={containerRefInputMobile} id="box-input-search">
          <AutocompleteBasicComponent
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
