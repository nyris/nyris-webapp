import { autocomplete } from '@algolia/autocomplete-js';
import { Box } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import algoliasearch from 'algoliasearch/lite';
import { popularSearchesPluginCreator } from 'components/autocomplete/plugins/popular-searches/popular-searches';
import { debounce } from 'lodash';
import React, {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { render } from 'react-dom';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useHistory } from 'react-router-dom';
import {
  onResetRequestImage,
  reset,
  updateValueTextSearchMobile,
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AlgoliaSettings, AppState } from 'types';
interface Props {
  containerRefInputMobile?: any;
  isiImageThumbSearchInput?: boolean;
  isResetImage?: boolean;
}

function AutocompleteBasicComponent(props: Props) {
  const {
    containerRefInputMobile,
    refine,
    isiImageThumbSearchInput,
    isResetImage,
  }: any = props;
  const [refBoxFilter, setRefBoxFilter] = useState<any>(null);
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { textSearchInputMobile } = search;
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const [refPanelContainer, setRefPanelContainer] = useState<any>(null);

  useEffect(() => {
    if (isResetImage) {
      dispatch(onResetRequestImage(''));
      setTimeout(() => {
        refine(textSearchInputMobile);
      }, 300);
      return;
    }
  }, [isResetImage, dispatch, refine, textSearchInputMobile]);

  useEffect(() => {
    setRefPanelContainer(panelContainerRef);
  }, [panelContainerRef]);

  useEffect(() => {
    setRefBoxFilter(containerRefInputMobile);
  }, [containerRefInputMobile]);

  const plugins = useMemo(
    () => [
      popularSearchesPluginCreator({
        searchClient,
        onSelect({ item }: any) {
          dispatch(updateValueTextSearchMobile(item?.keyword));
          refine(`${item?.keyword}`);
          if (history.location.pathname !== '/result') {
            history.push('/result');
          }
        },
        indexName,
        handerCloseModal() {
          setRefPanelContainer(<div></div>);
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchClient],
  );

  useEffect(() => {
    if (!refBoxFilter?.current || !refPanelContainer.current) {
      return;
    }
    const autocompleteInstance = autocomplete({
      container: refBoxFilter.current,
      panelContainer: refPanelContainer.current,
      panelPlacement: 'full-width',
      renderer: { createElement, Fragment, render: () => {} },
      initialState: {
        query: textSearchInputMobile,
      },
      translations: {
        detachedCancelButtonText: `‹`,
        submitButtonTitle: 's',
      },
      placeholder: textSearchInputMobile ? textSearchInputMobile : 'Search',
      plugins,
      openOnFocus: true,
      onSubmit,
      render({ sections, components }, root) {
        render(
          <Fragment>
            <div className="aa-PanelLayout aa-Panel--scollable ">
              {sections}
            </div>
          </Fragment>,
          root,
        );
      },

      ...props,
    });
    return () => {
      // Waiting for an 'unsubscribe' method on Autocomplete plugin API
      plugins.forEach((plugin: any) => {
        if (typeof plugin.unsubscribe === 'function') {
          plugin.unsubscribe();
        }
      });

      autocompleteInstance?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, refBoxFilter, refPanelContainer, textSearchInputMobile]);

  const onSubmit = ({ state }: any) => {
    debounceSearch(state?.query);
    dispatch(updateValueTextSearchMobile(state?.query));
    if (history.location.pathname !== '/result') {
      history.push('/result');
    }
  };
  const debounceSearch = useCallback(
    debounce((nextValue: any) => refine(nextValue), 200),
    [],
  );

  return (
    <>
      <div className="panel-container-custom" ref={panelContainerRef} />
      {history.location?.pathname !== '/' && textSearchInputMobile && (
        <Box className="btn-close-header" style={{ backgroundColor: '#fff' }}>
          <button
            onClick={() => {
              if (isiImageThumbSearchInput) {
                dispatch(updateValueTextSearchMobile(''));
                refine('');
                return;
              }
              dispatch(updateValueTextSearchMobile(''));
              dispatch(reset(''));
              refine('');
              history.push('/');
            }}
            style={{
              backgroundColor: '#fff',
              border: 0,
              padding: '0px 0px 0 16px',
              display: 'flex',
            }}
          >
            <CloseIcon style={{ fontSize: 20, color: '#3e36dc' }} />
          </button>
        </Box>
      )}
    </>
  );
}

const AutocompleteBasicMobileComponent = connectSearchBox<any>(
  AutocompleteBasicComponent,
);
export default AutocompleteBasicMobileComponent;
