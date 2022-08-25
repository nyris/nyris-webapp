import React, {
  createElement,
  memo,
  useEffect,
  useMemo,
  Fragment,
  useCallback,
  useState,
  useRef,
} from "react";
import { autocomplete, Pragma } from "@algolia/autocomplete-js";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { AlgoliaSettings, AppState } from "types";
import algoliasearch from "algoliasearch/lite";
import { popularSearchesPluginCreator } from "components/autocomplete/plugins/popular-searches/popular-searches";
import { connectSearchBox } from "react-instantsearch-dom";
import { debounce } from "lodash";
import { useHistory } from "react-router-dom";
import { render } from "react-dom";
import { updateValueTextSearchMobile } from "Store/Search";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
interface Props {
  containerRefInputMobile?: any;
}

function AutocompleteBasicComponent(props: Props) {
  const { containerRefInputMobile, refine }: any = props;
  const [refBoxFilter, setRefBoxFilter] = useState<any>(null);
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const panelRootRef = useRef<any>(null);
  const { textSearchInputMobile } = search;
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const [refPanelContainer, setRefPanelContainer] = useState<any>(null);

  useEffect(() => {
    setRefPanelContainer(panelContainerRef);
  }, [panelContainerRef]);

  useEffect(() => {
    setRefBoxFilter(containerRefInputMobile);
  }, []);

  const plugins = useMemo(
    () => [
      popularSearchesPluginCreator({
        searchClient,
        onSelect({ item }: any) {
          dispatch(updateValueTextSearchMobile(item?.keyword));
          refine(`${item?.keyword}`);
          if (history.location.pathname !== "/result") {
            history.push("/result");
          }
        },
        indexName,
        handerCloseModal() {
          setRefPanelContainer(<div></div>);
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchClient]
  );

  useEffect(() => {
    if (!refBoxFilter?.current || !refPanelContainer.current) {
      return;
    }
    const autocompleteInstance = autocomplete({
      container: refBoxFilter.current,
      panelContainer: refPanelContainer.current,
      panelPlacement: "full-width",
      renderer: { createElement, Fragment, render: () => {} },
      initialState: {
        query: textSearchInputMobile,
      },
      translations: {
        detachedCancelButtonText: `‹`,
        submitButtonTitle: "s",
      },
      placeholder: textSearchInputMobile ? textSearchInputMobile : "Search",
      plugins,
      openOnFocus: true,
      onSubmit,
      debug: true,
      // getSources: {},
      render({ sections, components }, root) {
        render(
          <Fragment>
            <div className="aa-PanelLayout aa-Panel--scollable ">
              {sections}
            </div>
            {/* <components.MyComponent /> */}
          </Fragment>,
          root
        );
      },

      ...props,
    });
    return () => {
      // Waiting for an 'unsubscribe' method on Autocomplete plugin API
      plugins.forEach((plugin: any) => {
        if (typeof plugin.unsubscribe === "function") {
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
    if (history.location.pathname !== "/result") {
      history.push("/result");
    }
  };
  const debounceSearch = useCallback(
    debounce((nextValue: any) => refine(nextValue), 200),
    []
  );

  return (
    <>
      <div className="panel-container-custom" ref={panelContainerRef} />
    </>
  );
}

const AutocompleteBasicMobileComponent = connectSearchBox<any>(
  memo(AutocompleteBasicComponent)
);
export default AutocompleteBasicMobileComponent;
