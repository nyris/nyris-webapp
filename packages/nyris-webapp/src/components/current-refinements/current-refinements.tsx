import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { m } from 'framer-motion';
import { atom } from 'jotai';
import { useMemo } from 'react';
import { groupBy } from 'lodash';
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
      groupBy(
        newItems.reduce((acc: CurrentRefinement[], current) => {
          return [
            ...acc,
            ...getCurrentRefinement(current, settings?.refinements),
          ];
        }, []),
        'category',
      ),
    [settings, newItems],
  );

  if (!Object.keys(refinements).length) {
    return null;
  }

  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-3">
        {Object.keys(refinements).map(key => {
          return (
            <div
              style={{
                display: 'flex',
                columnGap: '5px',
                alignItems: 'center',
              }}
            >
              <div className="text-f14 fw-700">{key}:</div>

              {refinements[key].map(refinement => {
                return (
                  <ChipComponent
                    closeIcon={true}
                    onClick={() => refine(refinement.value)}
                  >
                    <div
                      className="capitalize"
                      style={{
                        marginLeft: 5,
                        textTransform: 'capitalize',
                        marginRight: 10,
                      }}
                    >
                      {refinement.label}
                    </div>
                  </ChipComponent>
                );
              })}
            </div>
          );
        })}

        <li
          key="clear"
          className={classNames('flex items-center', {
            hidden: Object.keys(refinements).length < 2,
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
