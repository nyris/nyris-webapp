import React, {
  createElement,
  memo,
  useEffect,
  useMemo,
  useRef,
  Fragment,
  ReactNode,
  useCallback,
} from "react";
import { autocomplete, Pragma } from "@algolia/autocomplete-js";
import { useAppSelector } from "Store/Store";
import { AlgoliaSettings, AppState } from "types";
import algoliasearch from "algoliasearch/lite";
import { popularSearchesPluginCreator } from "components/autocomplete/plugins/popular-searches/popular-searches";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { connectSearchBox } from "react-instantsearch-dom";
import { debounce } from "lodash";
import { useHistory } from "react-router-dom";
// import '@algolia/autocomplete-theme-classic';
interface Props {
  containerRefInputMobile?: any;
}

function AutocompleteBasicComponent(props: Props) {
  const { containerRefInputMobile, refine }: any = props;
  // const containerRef = useRef<HTMLDivElement | any>(null);
  const panelRootRef = useRef<Root | any>(null);
  const rootRef = useRef<HTMLElement | any>(null);
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const history = useHistory();

  const plugins = useMemo(
    () => [
      popularSearchesPluginCreator({
        searchClient,
        onSelect({ item }: any) {
          refine(`${item?.keyword}`);
          if (history.location.pathname !== "/result") {
            history.push("/result");
          }
        },
        indexName,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchClient]
  );

  useEffect(() => {
    if (!containerRefInputMobile?.current) {
      return;
    }
    const autocompleteInstance = autocomplete({
      container: "#box-input-search",
      renderer: {
        createElement: createElement as Pragma,
        Fragment,
        render: () => {},
      },
      render({ children: acChildren }, root) {
        rootRef.current = root;
        panelRootRef.current?.unmount();
        panelRootRef.current = createRoot(root);
        panelRootRef.current.render(acChildren as ReactNode);
      },
      plugins,
      openOnFocus: true,
      onSubmit,
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
  }, [plugins]);
  // console.log("containerRef", containerRef);

  const onSubmit = ({ state }: any) => {
    console.log("321 state", state);
    debounceSearch(state?.query);
    if (history.location.pathname !== "/result") {
      history.push("/result");
    }
  };
  const debounceSearch = useCallback(
    debounce((nextValue: any) => refine(nextValue), 200),
    []
  );

  return <></>;
}

const AutocompleteBasicMobileComponent = connectSearchBox<any>(
  memo(AutocompleteBasicComponent)
);
export default AutocompleteBasicMobileComponent;
