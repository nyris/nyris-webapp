import React from 'react';
import { Button } from '@material-ui/core';
import { memo, useCallback } from 'react';
import isEqual from 'react-fast-compare';
import type { CurrentRefinementsProvided } from 'react-instantsearch-core';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { useAppSelector } from 'Store/Store';
import { AppState } from 'types';

export type ClearRefinementsProps = CurrentRefinementsProvided & {
  children: React.ReactNode;
  type?: any;
  className?: string;
};

function ClearRefinementsComponent({
  children,
  type = 'native',
  className,
  items,
  refine,
}: ClearRefinementsProps) {
  const handleButtonClick = useCallback(() => refine(items), [refine, items]);
  const { settings } = useAppSelector<AppState>((state: any) => state);

  return (
    <Button
      type={type}
      disabled={!items.length}
      className={className}
      onClick={handleButtonClick}
      style={{
        color: settings.themePage.searchSuite?.secondaryColor,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        padding: 0,
      }}
    >
      {children}
    </Button>
  );
}

export const ClearRefinements = connectCurrentRefinements<any>(
  memo(ClearRefinementsComponent, isEqual),
);
