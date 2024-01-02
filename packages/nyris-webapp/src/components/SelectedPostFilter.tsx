import React from 'react';
import classNames from 'classnames';
import { ReactComponent as IconClose } from 'common/assets/icons/close.svg';
import { atom } from 'jotai';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { useFilter } from 'hooks/useFilter';
import { get } from 'lodash';
import { clearPostFilter, setPostFilter } from 'Store/search/Search';
import { Box } from '@material-ui/core';

export type CurrentRefinementsProps = {
  className?: string;
};

export type CurrentRefinement = {
  category?: string;
  label: string;
};

export const refinementCountAtom = atom(0);

export function SelectedPostFilter({ className }: CurrentRefinementsProps) {
  const stateGlobal = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const {
    search: { postFilter, results },
  } = stateGlobal;
  const filter = useFilter(results);

  const selectedFilters = useMemo(() => {
    const selectedFilters: any[] = [];
    Object.keys(filter).forEach(key => {
      const values = filter[key];
      values.forEach((data: { value: string }) => {
        if (get(postFilter, `${key}.${data.value}`)) {
          selectedFilters.push({ key, ...data });
        }
      });
    });
    return selectedFilters;
  }, [filter, postFilter]);

  if (!selectedFilters.length) {
    return null;
  }

  return (
    <Box className="wrap-box-refinements">
      <div style={{ display: 'flex', flexFlow: 'wrap', columnGap: '8px' }}>
        {selectedFilters.map(filter => {
          return (
            <div
              key={filter.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                columnGap: '12px',
                fontSize: '12px',
                padding: '4px 8px 4px 8px',
                backgroundColor: '#E9E9EC',
                borderRadius: '18px',
                width: 'fit-content',
              }}
            >
              <p>
                {filter.value} ({filter.count})
              </p>
              <div
                style={{
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  dispatch(
                    setPostFilter({
                      [filter.key]: filter.value,
                    }),
                  );
                }}
              >
                <IconClose width={12} height={12} />
              </div>
            </div>
          );
        })}
        <div
          key="clear"
          className={classNames('flex items-center')}
          style={{ padding: '4px', cursor: 'pointer' }}
          onClick={() => dispatch(clearPostFilter())}
        >
          <div className="text-f12" style={{ color: '#E31B5D' }}>
            Clear all
          </div>
        </div>
      </div>
    </Box>
  );
}
