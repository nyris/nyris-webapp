import { Box, Typography } from "@material-ui/core";
import React, { memo } from "react";
import { connectRefinementList } from "react-instantsearch-dom";

function RefinementList({
  items,
  refine,
  searchForItems,
  options,
  currentRefinement,
  switched,
}: any) {
  
  return (
    <ul>
      {options?.searchable && (
        <input
          type="search"
          onChange={(event) => searchForItems(event.currentTarget.value)}
        />
      )}
      {items.map((item: any) => {
        return (
          <li key={item.label}>
            <Box display={"flex"} alignItems={"center"}>
              <input
                style={{ marginRight: 5 }}
                type="checkbox"
                onChange={(e: any) => {
                  return refine(item.value);
                }}
              />
              <Typography>{item.label}</Typography>
            </Box>
          </li>
        );
      })}
    </ul>
  );
}

export const CustomRefinemnetList = connectRefinementList(memo(RefinementList));
