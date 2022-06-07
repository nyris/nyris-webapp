import React, { useCallback, useMemo,  } from "react";
import { useAtomValue } from "jotai/utils";
import type { MouseEventHandler } from "react";
import type {
  CurrentRefinementsProvided,
  SearchResults,
} from "react-instantsearch-core";

import { useGetRefinementWidgets } from "./useGetRefinementWidgets";
import { configAtom } from "./config";
import { getPanelAttributes, getPanelId } from "./refinements";
import { atom, useAtom } from "jotai";
import { ExpandablePanelCustom } from "./expandable-panel";
import { DynamicWidgets } from "components/dynamic-widgets/dynamic-widgets";

export type ExpandablePanelProps = CurrentRefinementsProvided & {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode | string;
  attributes?: string[];
  isOpened?: boolean;
  onToggle?: any;
};
export type Panels = {
  [key: string]: boolean;
};

export function useHasRefinements(
  searchResults: SearchResults,
  attributes: string[] = []
) {
  const facets = useMemo(() => {
    const disjunctiveFacets = searchResults?.disjunctiveFacets || [];
    const hierarchicalFacets = searchResults?.hierarchicalFacets || [];
    return [...disjunctiveFacets, ...hierarchicalFacets];
  }, [searchResults]);

  const hasRefinements = useMemo(() => {
    let found = !attributes.length;

    facets.forEach((facet) => {
      attributes?.forEach((attribute) => {
        if (facet.name === attribute && facet.data) {
          found = true;
        }
      });
    });

    return found;
  }, [facets, attributes]);

  return hasRefinements;
}

export function useCurrentRefinementCount(items: any[], attributes: string[]) {
  return useMemo(() => {
    let count = 0;

    attributes?.forEach((attribute) => {
      const tmp: string[] = [];

      let currentRefinement = items.find(
        (item) => item.attribute === attribute
      )?.currentRefinement;
      currentRefinement = currentRefinement
        ? tmp.concat(currentRefinement)
        : tmp;

      count += currentRefinement.length;
    });

    return count;
  }, [items, attributes]);
}
export const refinementsPanelsAtom = atom<Panels>({});

function WidgetPanel({ children, onToggle, panelId, ...props }: any) {
  const onToggleMemoized = useCallback(
    () => onToggle(panelId),
    [onToggle, panelId]
  );

  return (
    <ExpandablePanelCustom onToggle={onToggleMemoized} {...props}>
      {children}
    </ExpandablePanelCustom>
  );
}

export default function ExpandablePanelComponent({
  dynamicWidgets = true
}: any) {
  const { refinements } = useAtomValue(configAtom);
  const widgets = useGetRefinementWidgets(refinements);
  const [panels, setPanels] = useAtom(refinementsPanelsAtom);
  
  const onToggle = useCallback(
    (panelId: string) => {
      setPanels((prevPanels) => {
        return {
          [panelId]: !prevPanels[panelId],
        };
      });
    },
    [setPanels]
  );

  const widgetsPanels = useMemo(
    () =>
      widgets.map((widget, i) => {
        const refinement = refinements[i];
        const panelId = getPanelId(refinement);
        const panelAttributes = getPanelAttributes(refinement);

        return (
          <WidgetPanel
            key={panelId}
            panelId={panelId}
            attributes={panelAttributes}
            header={refinement.header}
            isOpened={panels[panelId]}
            onToggle={onToggle}
          >
            {widget}
          </WidgetPanel>
        );
      }),
    [widgets, refinements, onToggle, panels]
  );

  return (
    <div>
      <DynamicWidgets enabled={dynamicWidgets}>
        {widgetsPanels}
      </DynamicWidgets>
    </div>
  );
}

// export const ExpandablePanel = connectCurrentRefinements<any>(
//   memo(ExpandablePanelComponent, isEqual)
// );
