import { Button } from '@material-ui/core';
import { ReactComponent as RemoveIcon } from 'common/assets/icons/minus.svg';
import { ReactComponent as AddIcon } from 'common/assets/icons/add.svg';
import classNames from 'classnames';
import { Collapse } from 'components/collapse/collapse';
import type { MouseEventHandler } from 'react';
import React, { memo } from 'react';
import type { CurrentRefinementsProvided } from 'react-instantsearch-core';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';

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
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  return (
    <div>
      <div
        className={classNames(className)}
        style={{
          borderTop: !isMobile ? '1px solid #d3d4d8' : '',
        }}
      >
        <Button
          className="w-full flex items-center justify-between group"
          aria-expanded={isOpened}
          style={{
            paddingLeft: '2px',
            paddingRight: '2px',
            paddingTop: !isMobile ? '8px' : '0px',
            paddingBottom: '8px',
            marginTop: '16px',
            marginBottom: '16px',
          }}
          onClick={e => {
            if (typeof onToggle === 'function') {
              onToggle(e);
            }
          }}
        >
          <div className="flex items-center w-full subhead">
            <p
              style={{
                textTransform: 'none',
                fontFamily: 'Source Sans 3 !important',
                fontSize: 14,
                fontWeight: 'bold',
                lineHeight: '16px',
              }}
            >
              {header || attributes[0]}
            </p>
          </div>
          {!isMobile && <>{isOpened ? <RemoveIcon /> : <AddIcon />}</>}
        </Button>

        <Collapse isCollapsed={!isOpened}>
          <div className="mt-4">{children}</div>
        </Collapse>
      </div>
    </div>
  );
}

export const ExpandablePanelCustom = connectCurrentRefinements<any>(
  memo(ExpandablePanelComponent),
);
