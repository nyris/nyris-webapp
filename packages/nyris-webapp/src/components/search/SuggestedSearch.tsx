import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import { Box } from "@material-ui/core";
import algoliasearch from "algoliasearch";
import React, { useMemo } from "react";
import { useAppSelector } from "Store/Store";
import { AlgoliaSettings, AppState } from "types";

interface Props {
}

export function SuggestedSearch(props: Props) {
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  searchClient.initIndex(indexName);
  return createQuerySuggestionsPlugin({
    searchClient,
    indexName: indexName,
    categoryAttribute: ["Normparts"],
    // getSearchParams() {
    //   return recentSearchesPlugin.data?.getAlgoliaSearchParams({
    //     hitsPerPage: 4,
    //   }) as SearchOptions
    // },
    transformSource({ source }) {
      debugger;
      return {
        ...source,
        onSelect(params) {
          // if (typeof customOnSelect === 'function') {
          //   customOnSelect(params)
          // }
        },
        templates: {
          ...source.templates,
          header() {
            return (
              <span className="aa-SourceHeaderTitle">lalala Searches</span>
            );
          },
          item({ item, components }: any) {
            debugger;
            return (
              <div className="aa-ItemWrapper">
                <div className="aa-ItemContent">
                  <div className="aa-ItemIcon aa-ItemIcon--noBorder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.8 18.8L15.6 14.6C16.6 13.4 17.1 12 17.1 10.5C17.1 6.9 14.2 4 10.6 4C6.9 4 4 6.9 4 10.5C4 14.1 6.9 17 10.5 17C12 17 13.4 16.5 14.6 15.5L18.8 19.7C18.9 19.8 19.1 19.9 19.3 19.9C19.5 19.9 19.7 19.8 19.8 19.7C19.9 19.6 20 19.4 20 19.2C20 19.1 19.9 18.9 19.8 18.8ZM10.5 15.6C7.7 15.6 5.4 13.3 5.4 10.5C5.4 7.7 7.7 5.4 10.5 5.4C13.3 5.4 15.6 7.7 15.6 10.5C15.6 13.4 13.4 15.6 10.5 15.6Z" />
                    </svg>
                  </div>
                  <div className="aa-ItemContentBody">
                    <div className="aa-ItemContentTitle">
                      <components.ReverseHighlight
                        hit={item}
                        attribute="query"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        },
      };
    },
  });
}

