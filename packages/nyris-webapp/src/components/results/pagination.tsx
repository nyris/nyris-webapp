import { connectPagination } from "react-instantsearch-dom";
import React from "react";

const Pagination = ({ currentRefinement, nbPages, refine, createURL }: any) => {
  console.log('currentRefinement', currentRefinement);
  
  return (
    <ul>
      {new Array(nbPages).fill(null).map((_, index) => {
        const page = index + 1;
        const style = {
          fontWeight: currentRefinement === page ? "bold" : "",
        };

        return (
          <li key={index}>
            <a
              href={createURL(page)}
              // style={style}
              onClick={(event) => {
                event.preventDefault();
                refine(page);
              }}
            >
              {page}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export const CustomPagination = connectPagination(Pagination);
