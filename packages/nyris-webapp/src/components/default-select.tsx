import { Box } from "@material-ui/core";
import React from "react";
import { connectMenu } from "react-instantsearch-dom";

function DefaultSelectCustom({ items, currentRefinement, refine }: any) {

  return (
    <Box className="w-100">
      <select
        className="w-100 btn-ct"
        value={currentRefinement || ""}
        onChange={(event: any) => {
          refine(event?.currentTarget.value);
        }}
      >
        <option value="">See all options</option>
        {items.map((item: any) => (
          <option
            key={item.label}
            value={item.isRefined ? currentRefinement : item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </Box>
  );
}
const DefaultSelect = connectMenu(DefaultSelectCustom);

export default DefaultSelect;
