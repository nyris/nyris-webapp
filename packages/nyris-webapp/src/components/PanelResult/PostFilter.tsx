import { Button, Checkbox } from '@material-ui/core';
import { DynamicWidgetsCT } from 'components/dynamic-widgets/dynamic-widgets';
import IconLabel from 'components/icon-label/icon-label';
import { atom, useAtom } from 'jotai';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { CurrentRefinementsProvided } from 'react-instantsearch-core';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ExpandablePanelCustom } from './expandable-panel';
import { getPanelAttributes, getPanelId } from './refinements';
import { useTranslation } from 'react-i18next';
import { setPostFilter } from 'Store/search/Search';
import { useFilter } from 'hooks/useFilter';
import { get } from 'lodash';
import { Icon } from '@nyris/nyris-react-components';

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

export default function PostFilterPanel({
  dynamicWidgets = true,
  onApply,
}: any) {
  const stateGlobal = useAppSelector(state => state);
  const {
    settings,
    search: { postFilter, results },
  } = stateGlobal;
  const { refinements } = settings;
  const [panels, setPanels] = useAtom(refinementsPanelsAtom);
  const [refinementsPanelsExpanded, setRefinementsPanelsExpanded] = useAtom(
    refinementsPanelsExpandedAtom,
  );
  const history = useHistory();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const filter = useFilter(results);

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

  const widgets = useMemo(() => {
    return refinements.map((refinement: any) => {
      const filterList = filter?.[refinement.attribute];

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '16px',
            marginBottom: '8px',
          }}
        >
          {filterList?.map((item: any, index: number) => {
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '4px',
                }}
              >
                <Checkbox
                  color="primary"
                  size="small"
                  style={{ padding: '0px' }}
                  checked={
                    !!get(postFilter, `${refinement.attribute}.${item.value}`)
                  }
                  onChange={() => {
                    dispatch(
                      setPostFilter({
                        [refinement.attribute]: item.value,
                      }),
                    );
                  }}
                />
                <p style={{ fontSize: '14px', paddingTop: '3px' }}>
                  {item.value}
                </p>
                <p style={{ fontSize: '14px', paddingTop: '3px' }}>
                  ({item.count})
                </p>
              </div>
            );
          })}
        </div>
      );
    });
  }, [refinements, filter, postFilter, dispatch]);

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
              <Icon name="close" color="#2B2C46" />
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
            {t('Cancel')}
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
            {t('Apply')}
          </div>
        </div>
      )}
    </>
  );
}
