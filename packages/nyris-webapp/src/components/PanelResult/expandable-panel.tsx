import React, { memo, useEffect, useState } from "react";
import classNames from "classnames";
import { useAtomValue } from "jotai/utils";
import type { MouseEventHandler } from "react";
import type {
  CurrentRefinementsProvided,
  SearchResults,
} from "react-instantsearch-core";
import { connectCurrentRefinements } from "react-instantsearch-dom";
import { useHasRefinements } from ".";
import { searchResultsAtom } from "./virtual-state-results";
import { Box, Button, Typography } from "@material-ui/core";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import { Collapse } from "components/collapse/collapse";
import { useMediaQuery } from "react-responsive";

export type ExpandablePanelProps = CurrentRefinementsProvided & {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode | string;
  footer?: string;
  attributes?: string[];
  isOpened?: boolean;
  onToggle?: MouseEventHandler;
};

function ExpandablePanelComponent({
  children,
  className,
  header,
  attributes = [],
  isOpened = false,
  items,
  onToggle,
}: ExpandablePanelProps) {
  const searchResults = useAtomValue(searchResultsAtom) as SearchResults;
  const hasRefinements = useHasRefinements(searchResults, attributes);
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });

  return (
    <Box>
      <div
        className={classNames(
          "border-neutral-light",
          {
            hidden: !hasRefinements,
          },
          className
        )}
      >
        <Button
          className="w-full flex items-center justify-between group"
          aria-expanded={isOpened}
          style={{ paddingLeft: 0 }}
          onClick={(e) => {
            if (typeof onToggle === "function") {
              onToggle(e);
            }
          }}
        >
          <div className="flex items-center w-full subhead">
            <Typography
              className="fw-700"
              style={{
                textTransform: "none",
                fontFamily: "Montserrat !important",
                fontSize: 14,
              }}
            >
              {header || attributes[0]}
            </Typography>
          </div>
          {!isMobile && (
            <div className="text-neutral-dark can-hover:transition-colors can-hover:group-hover:text-neutral-light">
              {isOpened ? <RemoveIcon /> : <AddIcon />}
            </div>
          )}
        </Button>

        <Collapse isCollapsed={!isOpened}>
          <div className="mt-4">{children}</div>
        </Collapse>
      </div>
    </Box>
  );
}

export const ExpandablePanelCustom = connectCurrentRefinements<any>(
  memo(ExpandablePanelComponent)
);
