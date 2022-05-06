import { Box } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { connectMenu } from "react-instantsearch-dom";

interface Props {
  dataField: any[];
}

function DefaultSelectCustom({ items, currentRefinement, refine }: any) {
  const [valueFilter, setValueFilter] = useState<string>();

  useEffect(() => {
    if (!valueFilter) {
      return;
    }
    refine(valueFilter);
  }, [valueFilter]);

  return (
    <Box className="w-100">
      <select
        className="w-100 btn-ct"
        value={currentRefinement || ""}
        onChange={(event: any) => {
          setValueFilter(event?.currentTarget.value);
          // refine(event.currentTarget.value);
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
