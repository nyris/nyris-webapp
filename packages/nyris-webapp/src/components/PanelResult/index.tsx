import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CurrentRefinementsProvided,
  SearchResults,
} from "react-instantsearch-core";
import { getPanelAttributes, getPanelId } from "./refinements";
import { atom, useAtom } from "jotai";
import { ExpandablePanelCustom } from "./expandable-panel";
import { DynamicWidgetsCT } from "components/dynamic-widgets/dynamic-widgets";
import { Box, Button, FormControlLabel } from "@material-ui/core";
import IconLabel from "components/icon-label/icon-label";
import { useAppSelector } from "Store/Store";
import { IOSSwitch } from "components/switch";
import { RefinementList } from "react-instantsearch-dom";

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

function togglePanels(panels: Panels, val: boolean) {
  return Object.keys(panels).reduce(
    (acc, panelKey) => ({ ...acc, [panelKey]: val }),
    {}
  );
}

export const refinementsPanelsExpandedAtom = atom(
  (get) =>
    Boolean(Object.values(get(refinementsPanelsAtom)).find((v) => v === true)),
  (get, set, update: (prev: boolean) => boolean) => {
    const expanded = update(get(refinementsPanelsExpandedAtom));
    set(
      refinementsPanelsAtom,
      togglePanels(get(refinementsPanelsAtom), expanded)
    );
  }
);

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
  dynamicWidgets = true,
  onToogleApplyFillter,
}: any) {
  const [switched, setChangeSwitch] = useState(true);
  const stateGlobal = useAppSelector((state) => state);
  const { settings } = stateGlobal;
  const { refinements } = settings;
  const [panels, setPanels] = useAtom(refinementsPanelsAtom);
  const [refinementsPanelsExpanded, setRefinementsPanelsExpanded] = useAtom(
    refinementsPanelsExpandedAtom
  );

  // Set initial panels value
  useEffect(() => {
    setPanels((prevPanels) => ({
      ...prevPanels,
      ...refinements.reduce(
        (acc: any, current: any) => ({
          ...acc,
          [getPanelId(current)]: Boolean(current.isExpanded),
        }),
        {}
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = useCallback(
    (panelId: string) => {
      setPanels((prevPanels) => {
        return {
          ...prevPanels,
          [panelId]: !prevPanels[panelId],
        };
      });
    },
    [setPanels]
  );

  const widgets = useMemo(
    () =>
      refinements.map((refinement: any) => {
        return (
          <Box>
            <RefinementList
              className="box-refinement-list"
              attribute={refinement.attribute}
              {...refinement.options}
              translations={{
                noResults: "No results",
                placeholder: "",
              }}
            />
          </Box>
        );
      }),
    [refinements]
  );

  const widgetsPanels = useMemo(() => {
    return widgets.map((widget: any, i: any) => {
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
    });
  }, [widgets, refinements, onToggle, panels]);

  const onTogglePanelsClick = useCallback(() => {
    setRefinementsPanelsExpanded((expanded: boolean) => !expanded);
  }, [setRefinementsPanelsExpanded]);

  return (
    <>
      <div className="wrap-main-header-panel">
        <Box style={{ borderBottom: "1px solid #E0E0E0" }}>
          <Button
            className="text-neutral-darkest"
            onClick={onTogglePanelsClick}
            style={{ justifyContent: "flex-end" }}
          >
            <IconLabel
              icon={refinementsPanelsExpanded ? "remove" : "add"}
              label={`${refinementsPanelsExpanded ? "Collapse" : "Expand"} all`}
            />
          </Button>
        </Box>
        <Box className="box-switch-apply-fillter">
          <FormControlLabel
            style={{ fontSize: 14 }}
            control={
              <IOSSwitch
                checked={switched}
                onChange={(e: any) => {
                  setChangeSwitch(e.target.checked);
                  onToogleApplyFillter(e.target.checked);
                }}
                name="checkedSwitch"
              />
            }
            label="Show only applied filters"
          />
        </Box>
      </div>
      <DynamicWidgetsCT enabled={dynamicWidgets}>
        {widgetsPanels}
      </DynamicWidgetsCT>
    </>
  );
}
