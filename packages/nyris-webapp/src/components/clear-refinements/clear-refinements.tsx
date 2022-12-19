import React from "react";
import { Button } from "@material-ui/core";
import { memo, useCallback } from "react";
import isEqual from "react-fast-compare";
import type { CurrentRefinementsProvided } from "react-instantsearch-core";
import { connectCurrentRefinements } from "react-instantsearch-dom";

export type ClearRefinementsProps = CurrentRefinementsProvided & {
  children: React.ReactNode;
  type?: any;
  className?: string;
};

function ClearRefinementsComponent({
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
      style={{
        color: "#3E36DC",
        fontWeight: "bold",
        textTransform: "capitalize",
        padding: 0,
      }}
    >
      {children}
    </Button>
  );
}

export const ClearRefinements = connectCurrentRefinements<any>(
  memo(ClearRefinementsComponent, isEqual)
);
