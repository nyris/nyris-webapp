import { Button } from "@material-ui/core";
import { ClearRefinementsProps } from "components/clear-refinements/clear-refinements";
import React, { memo, useCallback } from "react";
import { connectCurrentRefinements } from "react-instantsearch-dom";

interface Props {}

function ClearFillter({
  children,
  type = "native",
  className,
  items,
  refine,
}: ClearRefinementsProps) {
  
  const handleButtonClick = useCallback(() => refine(items), [refine, items]);
  return (
    <Button
      type={type}
      disabled={!items.length}
      className={className}
      onClick={handleButtonClick}
    >
      {children}
    </Button>
  );
}
export const ClearRefinements = connectCurrentRefinements<any>(
  memo(ClearFillter)
);
