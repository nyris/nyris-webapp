import React, { useState } from "react";
import { Box } from "@material-ui/core";
import { connectStateResults } from "react-instantsearch-dom";

function LoadingScreen({
  searchState,
  searchResults,
  children,
  isSearchStalled,
  searchingForFacetValues,
  searching,
}: any) {
  const [isLoading] = useState<boolean>(false);

  return (
    <>
      {isLoading && (
        <Box className="box-wrap-loading">
          <Box className="loadingSpinCT">
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}
      {children}
    </>
  );
}
const LoadingScreenCustom = connectStateResults(LoadingScreen);
export default LoadingScreenCustom;
