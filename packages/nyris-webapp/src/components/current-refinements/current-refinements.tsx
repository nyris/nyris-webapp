import React from "react";
import classNames from 'classnames'
import { configAtom } from 'components/PanelResult/config'
import { m } from 'framer-motion'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { memo, useEffect, useMemo } from 'react'
import isEqual from 'react-fast-compare'
import type {
  CurrentRefinementsProvided,
  RefinementValue,
} from 'react-instantsearch-core'
import { connectCurrentRefinements } from 'react-instantsearch-dom'
import { getCurrentRefinement } from './getCurrentRefinement'
import { ClearRefinements } from "components/clear-refinements/clear-refinements";
import ChipComponent from "components/chip/chip";

export type CurrentRefinementsProps = CurrentRefinementsProvided & {
  header?: string
  className?: string
}

export type CurrentRefinement = {
  category?: string
  label: string
  value: RefinementValue
}

export const refinementCountAtom = atom(0)

function CurrentRefinementsComponent({
  items,
  refine,
  header,
  className,
}: CurrentRefinementsProps) {
  const config = useAtomValue(configAtom)

  const refinements = useMemo(
    () =>
      items.reduce((acc: CurrentRefinement[], current) => {
        return [...acc, ...getCurrentRefinement(current, config)]
      }, []),
    [config, items]
  );

  const setRefinementCount = useUpdateAtom(refinementCountAtom)
  useEffect(() => {
    setRefinementCount(refinements.length)
  }, [setRefinementCount, refinements])

  if (!refinements.length) return null

  return (
    <div className={className}>
      {header && <div className="text-neutral-dark mb-2">{header}</div>}
      <ul className="flex flex-wrap gap-3">
        {refinements.map((refinement) => {
          return (
            <m.li key={[refinement.category, refinement.label].join(':')}>
              <ChipComponent closeIcon={true} onClick={() => refine(refinement.value)}>
                {refinement.category && (
                  <div className="text-f12 fw-600">{refinement.category}:</div>
                )}
                <div className="capitalize" style={{marginLeft: 5}}>{refinement.label}</div>
              </ChipComponent>
            </m.li>
          )
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
  )
}

export const CurrentRefinements = connectCurrentRefinements<any>(
  memo(
    CurrentRefinementsComponent,
    isEqual
  )
)
