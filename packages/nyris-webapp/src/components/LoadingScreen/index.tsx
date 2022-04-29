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
  // const hasResults = searchResults && searchResults.nbHits !== 0;

  // useEffect(() => {
  //   if (searching) {
  //     return;
  //   } else {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 1000);
  //   }
  // }, [searching, searchResults]);
  console.log("searchResults", searchResults);

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
