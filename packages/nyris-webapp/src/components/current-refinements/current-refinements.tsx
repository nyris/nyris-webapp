import React from "react";
import classNames from "classnames";
import { m } from "framer-motion";
import { atom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import { useEffect, useMemo } from "react";
import type {
  CurrentRefinementsProvided,
  RefinementValue,
} from "react-instantsearch-core";
import { connectCurrentRefinements } from "react-instantsearch-dom";
import { getCurrentRefinement } from "./getCurrentRefinement";
import { ClearRefinements } from "components/clear-refinements/clear-refinements";
import ChipComponent from "components/chip/chip";
import { useAppSelector } from "Store/Store";

export type CurrentRefinementsProps = CurrentRefinementsProvided & {
  header?: string;
  className?: string;
};

export type CurrentRefinement = {
  category?: string;
  label: string;
  value: RefinementValue;
};

export const refinementCountAtom = atom(0);

function CurrentRefinementsComponent({
  items,
  refine,
  header,
  className,
}: CurrentRefinementsProps) {
  const stateGlobal = useAppSelector((state) => state);
  const { settings } = stateGlobal;
  const refinements = useMemo(
    () =>
      items.reduce((acc: CurrentRefinement[], current) => {
        return [
          ...acc,
          ...getCurrentRefinement(current, settings?.refinements),
        ];
      }, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const setRefinementCount = useUpdateAtom(refinementCountAtom);
  useEffect(() => {
    setRefinementCount(refinements.length);
  }, [setRefinementCount, refinements]);

  if (!refinements.length) return null;

  return (
    <div className={className}>
      {header && <div className="text-neutral-dark mb-2">{header}</div>}
      <ul className="flex flex-wrap gap-3">
        {refinements.map((refinement) => {
          return (
            <m.li key={[refinement.category, refinement.label].join(":")}>
              <ChipComponent
                closeIcon={true}
                onClick={() => refine(refinement.value)}
              >
                {refinement.category && (
                  <div className="text-f12 fw-600">{refinement.category}:</div>
                )}
                <div className="capitalize" style={{ marginLeft: 5 }}>
                  {refinement.label}
                </div>
              </ChipComponent>
            </m.li>
          );
        })}
        <li
          key="clear"
          className={classNames("flex items-center", {
            hidden: refinements.length < 2,
          })}
        >
          <ClearRefinements className="text-f12 fw-600">
            Clear all
          </ClearRefinements>
        </li>
      </ul>
    </div>
  );
}

export const CurrentRefinements = connectCurrentRefinements<any>(
  CurrentRefinementsComponent
);
