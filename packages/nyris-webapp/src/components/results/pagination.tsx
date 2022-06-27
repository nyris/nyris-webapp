import React from "react";
import { connectPagination } from "react-instantsearch-dom";

function Pagination({ currentRefinement, nbPages, refine, createURL }: any) {
  return (
    <ul>
    {new Array(nbPages).fill(null).map((_, index) => {
      const page = index + 1;

      return (
        <li key={index}>
          <a href={createURL(page)}>{page}</a>
        </li>
      );
    })}
  </ul>
  );
}

export const CustomPagination = connectPagination(Pagination);
