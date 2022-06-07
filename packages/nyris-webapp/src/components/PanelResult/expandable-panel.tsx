import React from "react";
import classNames from 'classnames'
import { useAtomValue } from 'jotai/utils'
import type { MouseEventHandler } from 'react'
import { memo } from 'react'
import isEqual from 'react-fast-compare'
import type {
  CurrentRefinementsProvided,
  SearchResults,
} from 'react-instantsearch-core'
import { connectCurrentRefinements } from 'react-instantsearch-dom'
import { Count } from 'components/count/count'
import { useCurrentRefinementCount, useHasRefinements } from '.'
import { searchResultsAtom } from './virtual-state-results'
import { Button } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import Collapse from "components/collapse/collapse";

export type ExpandablePanelProps = CurrentRefinementsProvided & {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode | string
  footer?: string
  attributes?: string[]
  isOpened?: boolean
  onToggle?: MouseEventHandler
}

function ExpandablePanelComponent({
  children,
  className,
  items,
  header,
  footer,
  attributes = [],
  isOpened = false,
  onToggle,
}: ExpandablePanelProps) {
  const searchResults = useAtomValue(searchResultsAtom) as SearchResults
  const hasRefinements = useHasRefinements(searchResults, attributes)
  const currentRefinementCount = useCurrentRefinementCount(items, attributes)
  console.log('children 321312321321',children);
  
  return (
    <div
      className={classNames(
        'py-3.5 laptop:py-5 laptop:border-t laptop:border-neutral-light',
        {
          hidden: !hasRefinements,
        },
        className
      )}
    >
      <Button
        className="w-full flex items-center justify-between gap-3 group"
        aria-expanded={isOpened}
        onClick={(e) => {
          if (typeof onToggle === 'function') {
            onToggle(e)
          }
        }}
      >
        <div className="flex items-center w-full subhead laptop:small-bold laptop:uppercase">
          {header || attributes[0]}

          {/* {currentRefinementCount > 0 && (
            <Count className="ml-auto">{currentRefinementCount}</Count>
          )} */}
        </div>
        <div className="text-neutral-dark can-hover:transition-colors can-hover:group-hover:text-neutral-light">
          {isOpened ? <RemoveIcon /> : <AddIcon />}
        </div>
      </Button>

      <Collapse isCollapsed={!isOpened}>
        <div className="mt-4">{children}</div>
      </Collapse>
    </div>
  )
}

export const ExpandablePanelCustom = connectCurrentRefinements<any>(
  memo(
    ExpandablePanelComponent,
    isEqual
  )
)
