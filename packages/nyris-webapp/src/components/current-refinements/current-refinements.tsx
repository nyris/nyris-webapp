import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useMemo } from 'react';
import type {
  CurrentRefinementsProvided,
  RefinementValue,
} from 'react-instantsearch-core';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { getCurrentRefinement } from './getCurrentRefinement';
import { ClearRefinements } from 'components/clear-refinements/clear-refinements';
import { useAppSelector } from 'Store/Store';
import { useTranslation } from 'react-i18next';
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";

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

function CurrentRefinementsComponent({
  items,
  refine,
  className,
  statusSwitchButton,
}: CurrentRefinementsProps) {
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const { t } = useTranslation();
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
        marginBottom: '16px',
      }}
    >
      <ul className="flex flex-wrap gap-3">
        {refinements.map(refinement => {
          return (
            <li key={[refinement.category, refinement.label].join(':')}>
              {refinement.label}
              <CloseOutlinedIcon
                style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => refine(refinement.value)}
              />
            </li>
          );
        })}
        <li
          key="clear"
          className={classNames('flex items-center', {
            hidden: refinements.length < 2,
          })}
        >
          <ClearRefinements className="text-f12 fw-600">
            {t('Clear all')}
          </ClearRefinements>
        </li>
      </ul>
    </div>
  );
}

export const CurrentRefinements = connectCurrentRefinements<any>(
  CurrentRefinementsComponent,
);
