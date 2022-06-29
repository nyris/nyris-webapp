import React from "react";
import { connectRelevantSort } from "react-instantsearch-dom";

function RelevantSortComponent({ isRelevantSorted, refine }: any) {
  return (
    <button onClick={() => refine(isRelevantSorted ? 0 : undefined)}>
      Show {isRelevantSorted ? "all" : "relevant"} results
    </button>
  );
}

export const RelevantSort = connectRelevantSort(RelevantSortComponent);
