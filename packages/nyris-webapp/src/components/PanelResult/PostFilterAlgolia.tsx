import { Button } from '@material-ui/core';
import { DynamicWidgetsCT } from 'components/dynamic-widgets/dynamic-widgets';
import IconLabel from 'components/icon-label/icon-label';
import { atom, useAtom } from 'jotai';
import React, { useCallback, useEffect, useMemo } from 'react';
import type {
  CurrentRefinementsProvided,
  SearchResults,
} from 'react-instantsearch-core';
import { RefinementList } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { useAppSelector } from 'Store/Store';
import { ExpandablePanelCustom } from './expandable-panel';
import { getPanelAttributes, getPanelId } from './refinements';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';
import { useTranslation } from 'react-i18next';

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
  attributes: string[] = [],
) {
  const facets = useMemo(() => {
    const disjunctiveFacets = searchResults?.disjunctiveFacets || [];
    const hierarchicalFacets = searchResults?.hierarchicalFacets || [];
    return [...disjunctiveFacets, ...hierarchicalFacets];
  }, [searchResults]);

  const hasRefinements = useMemo(() => {
    let found = !attributes.length;

    facets.forEach(facet => {
      attributes?.forEach(attribute => {
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
    {},
  );
}

export const refinementsPanelsExpandedAtom = atom(
  get =>
    Boolean(Object.values(get(refinementsPanelsAtom)).find(v => v === true)),
  (get, set, update: (prev: boolean) => boolean) => {
    const expanded = update(get(refinementsPanelsExpandedAtom));
    set(
      refinementsPanelsAtom,
      togglePanels(get(refinementsPanelsAtom), expanded),
    );
  },
);

export const refinementsPanelsAtom = atom<Panels>({});

function WidgetPanel({ children, onToggle, panelId, ...props }: any) {
  const onToggleMemoized = useCallback(
    () => onToggle(panelId),
    [onToggle, panelId],
  );

  return (
    <ExpandablePanelCustom onToggle={onToggleMemoized} {...props}>
      {children}
    </ExpandablePanelCustom>
  );
}

export default function PostFilterPanelAlgolia({
  dynamicWidgets = true,
  onApply,
  disjunctiveFacets,
}: any) {
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const { refinements } = settings;
  const [panels, setPanels] = useAtom(refinementsPanelsAtom);
  const [refinementsPanelsExpanded, setRefinementsPanelsExpanded] = useAtom(
    refinementsPanelsExpandedAtom,
  );
  const history = useHistory();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { t } = useTranslation();

  // Set initial panels value
  useEffect(() => {
    setPanels(prevPanels => ({
      ...prevPanels,
      ...refinements.reduce(
        (acc: any, current: any) => ({
          ...acc,
          [getPanelId(current)]: Boolean(current.isExpanded),
        }),
        {},
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = useCallback(
    (panelId: string) => {
      setPanels(prevPanels => {
        return {
          ...prevPanels,
          [panelId]: !prevPanels[panelId],
        };
      });
    },
    [setPanels],
  );

  const widgets = useMemo(
    () =>
      refinements.map((refinement: any) => {
        return (
          <RefinementList
            className="box-refinement-list"
            attribute={refinement.attribute}
            {...refinement.options}
            translations={{
              noResults: 'No results',
              placeholder: '',
            }}
            sortBy={['isRefined:desc', 'name:asc']}
          />
        );
      }),
    [refinements],
  );

  const widgetsPanels = useMemo(
    () =>
      widgets.map((widget: any, i: any) => {
        const refinement = refinements[i];
        const panelId = getPanelId(refinement);
        const panelAttributes = getPanelAttributes(refinement);

        return widget ? (
          <WidgetPanel
            key={panelId}
            panelId={panelId}
            attributes={panelAttributes}
            header={refinement.header}
            isOpened={isMobile ? !panels[panelId] : panels[panelId]}
            onToggle={onToggle}
          >
            {widget}
          </WidgetPanel>
        ) : (
          <></>
        );
      }),
    [widgets, refinements, onToggle, panels, isMobile],
  );

  const onTogglePanelsClick = useCallback(() => {
    setRefinementsPanelsExpanded((expanded: boolean) => !expanded);
  }, [setRefinementsPanelsExpanded]);

  const handlerApplyfillter = () => {
    onApply();
    if (history.location.pathname !== '/result') {
      history.push('/result');
    }
  };

  return (
    <>
      {!isMobile && (
        <div className="wrap-main-header-panel">
          <div
            style={{
              cursor: 'pointer',
              paddingBottom: '8px',
            }}
          >
            <div
              onClick={onTogglePanelsClick}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <IconLabel
                icon={refinementsPanelsExpanded ? 'remove' : 'add'}
                label={`${
                  refinementsPanelsExpanded
                    ? t('Collapse all')
                    : t('Expand all')
                } `}
              />
            </div>
          </div>
        </div>
      )}
      <div>
        {isMobile && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              top: '0px',
              zIndex: 100,
              background: 'white',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={onApply}
              style={{
                width: '32px',
                height: '32px',
              }}
            >
              <CloseIcon color="#2B2C46" />
            </Button>
          </div>
        )}
        <div
          className="box-center-filter"
          style={{
            ...(isMobile
              ? {
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  overflow: 'auto',
                  marginBottom: '12px',
                }
              : {}),
          }}
        >
          <DynamicWidgetsCT enabled={dynamicWidgets}>
            {widgetsPanels}
          </DynamicWidgetsCT>
        </div>
      </div>
      {isMobile && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            display: 'flex',
          }}
        >
          <div
            className="text-white"
            style={{
              width: '100%',
              backgroundColor: settings.theme?.secondaryColor,
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 0,
              height: '66px',
              textTransform: 'none',
              padding: '16px',
            }}
            onClick={handlerApplyfillter}
          >
            Cancel
          </div>
          <div
            className="text-white"
            style={{
              width: '100%',
              backgroundColor: settings.theme?.primaryColor,
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 0,
              height: '66px',
              textTransform: 'none',
              padding: '16px',
            }}
            onClick={handlerApplyfillter}
          >
            Apply filters
          </div>
        </div>
      )}
    </>
  );
}
