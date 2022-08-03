import { Box, Drawer } from "@material-ui/core";
import React, { memo, useCallback, useEffect, useState } from "react";
import CustomSearchBox from "./input/inputSearch";
import AutocompleteBasicComponent from "./auto-complete/basic";
// import { SuggestedSearch } from "./search/SuggestedSearch";

interface Props {
  onToggleFilterMobile?: any;
}

function HeaderMobile(props: Props): JSX.Element {
  const { onToggleFilterMobile } = props;
  const [containerRefInputMobile, setContainerRefInputMobile] = useState(null);
  const onGetRefInputSearchMobile = (refInput: any) => {
    setContainerRefInputMobile(refInput);
  };

  return (
    <Box className="wrap-header-mobile">
      <CustomSearchBox
        onToggleFilterMobile={onToggleFilterMobile}
        onGetRefInputSearchMobile={onGetRefInputSearchMobile}
      />
      <AutocompleteBasicComponent
        containerRefInputMobile={containerRefInputMobile}
      />
    </Box>
  );
}

export default memo(HeaderMobile);
