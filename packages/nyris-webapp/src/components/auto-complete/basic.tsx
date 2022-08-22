import React, {
  createElement,
  memo,
  useEffect,
  useMemo,
  Fragment,
  useCallback,
  useState,
} from "react";
import { autocomplete, Pragma } from "@algolia/autocomplete-js";
import { useAppSelector } from "Store/Store";
import { AlgoliaSettings, AppState } from "types";
import algoliasearch from "algoliasearch/lite";
import { popularSearchesPluginCreator } from "components/autocomplete/plugins/popular-searches/popular-searches";
import { connectSearchBox } from "react-instantsearch-dom";
import { debounce } from "lodash";
import { useHistory } from "react-router-dom";
import { render } from "react-dom";
interface Props {
  containerRefInputMobile?: any;
}

function AutocompleteBasicComponent(props: Props) {
  const { containerRefInputMobile, refine }: any = props;
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  const history = useHistory();
  const [initQuery, setInitQuey] = useState<string>("");

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
      container: containerRefInputMobile.current,
      renderer: {
        createElement: createElement as Pragma,
        Fragment,
      },
      initialState: {
        query: initQuery,
      },
      // render({ children }, root) {
      //   render(children, root);
      // },
      render({ sections, components }, root) {
        render(
          <Fragment>
            <div className="aa-PanelLayout aa-Panel--scollable ">{sections}</div>
            {/* <components.MyComponent /> */}
          </Fragment>,
          root
        );
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
    
    debounceSearch(state?.query);
    setInitQuey(state?.query);
    if (history.location.pathname !== "/result") {
      history.push("/result");
    }
  };
  const debounceSearch = useCallback(
    debounce((nextValue: any) => refine(nextValue), 200),
    []
  );
  console.log("initQuery", initQuery);

  return <></>;
}

const AutocompleteBasicMobileComponent = connectSearchBox<any>(
  memo(AutocompleteBasicComponent)
);
export default AutocompleteBasicMobileComponent;
