import { Grid } from "@material-ui/core";
import ItemResult from "components/results/ItemResult";
import React from "react";
import {
  useInfiniteHits,
  UseInfiniteHitsProps,
} from "react-instantsearch-hooks";

function InfiniteHits(props: any) {
  const { hits, isLastPage, showMore } = useInfiniteHits(props);
  console.log("props", useInfiniteHits(props));

  return (
    <>
      {hits.map((hit: any, index: any) => {
        return (
          <Grid item xs={3}>
            <ItemResult
              dataItem={hit?.hit}
              // handlerToggleModal={() => {
              //   handlerToggleModal(hit?.hit);
              // }}
              // handlerToggleModalShare={() => setOpenModalShare(true)}
              // indexItem={hit.__position}
            />
          </Grid>
        );
      })}
    </>
  );
}

export default InfiniteHits;
