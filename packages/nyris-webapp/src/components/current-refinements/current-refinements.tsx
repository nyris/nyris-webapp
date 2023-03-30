import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { m } from 'framer-motion';
import { atom } from 'jotai';
import { useMemo } from 'react';
import type {
  CurrentRefinementsProvided,
  RefinementValue,
} from 'react-instantsearch-core';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { getCurrentRefinement } from './getCurrentRefinement';
import { ClearRefinements } from 'components/clear-refinements/clear-refinements';
import ChipComponent from 'components/chip/chip';
import { useAppSelector } from 'Store/Store';

export type CurrentRefinementsProps = CurrentRefinementsProvided & {
  header?: string;
  className?: string;
  statusSwitchButton?: boolean;
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
  className,
  statusSwitchButton,
}: CurrentRefinementsProps) {
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const [newItems, setListItems] = useState<any[]>([]);

  useEffect(() => {
    if (!statusSwitchButton) return;
    setListItems(items);
  }, [items, statusSwitchButton]);

  const refinements = useMemo(
    () =>
      newItems.reduce((acc: CurrentRefinement[], current) => {
        return [
          ...acc,
          ...getCurrentRefinement(current, settings?.refinements),
        ];
      }, []),
    [settings, newItems],
  );

  if (!refinements.length) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        marginBottom: refinements.length > 0 ? '10px' : '0px',
        marginTop: refinements.length > 0 ? '16px' : '0px',
      }}
    >
      <ul className="flex flex-wrap gap-3">
        {refinements.map(refinement => {
          return (
            <m.li key={[refinement.category, refinement.label].join(':')}>
              <ChipComponent
                closeIcon={true}
                onClick={() => refine(refinement.value)}
              >
                {refinement.category && (
                  <div className="text-f12">{refinement.category}:</div>
                )}
                <div
                  className="capitalize fw-700"
                  style={{
                    marginLeft: 5,
                    textTransform: 'capitalize',
                    marginRight: 10,
                  }}
                >
                  {refinement.label}
                </div>
              </ChipComponent>
            </m.li>
          );
        })}
        <li
          key="clear"
          className={classNames('flex items-center', {
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
  CurrentRefinementsComponent,
);
