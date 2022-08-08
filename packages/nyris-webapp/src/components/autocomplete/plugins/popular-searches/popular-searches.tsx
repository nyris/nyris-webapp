import React from "react";
import type { OnSelectParams } from "@algolia/autocomplete-core";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import type { AutocompleteQuerySuggestionsHit } from "@algolia/autocomplete-plugin-query-suggestions/dist/esm/types";
import type { SearchClient } from "algoliasearch/lite";
import { Typography } from "@material-ui/core";

type PopularSearchesPluginCreatorParams = {
  searchClient: SearchClient;
  onSelect?: (params: OnSelectParams<AutocompleteQuerySuggestionsHit>) => void;
  indexName?: any;
};

export function popularSearchesPluginCreator({
  searchClient,
  onSelect: customOnSelect,
  indexName,
}: PopularSearchesPluginCreatorParams) {
  return createQuerySuggestionsPlugin({
    searchClient,
    indexName: indexName,
    categoryAttribute: [indexName, "brand", "keyword_0", "custom_category"],
    getSearchParams({ state }) {
      return { hitsPerPage: 5 };
    },
    transformSource({ source, onTapAhead }) {
      return {
        ...source,
        onSelect(params) {
          if (typeof customOnSelect === "function") {
            customOnSelect(params);
          }
        },
        templates: {
          header() {
            return (
              <span className="aa-SourceHeaderTitle">Suggested searches</span>
            );
          },
          item({ item }) {
            return (
              <div className="aa-ItemWrapper d-flex">
                <div className="aa-ItemContent">
                  <div className="aa-ItemContentBody">
                    <div className="aa-ItemContentTitle">
                      <Typography>{item.keyword}</Typography>
                    </div>
                  </div>
                </div>
                <div className="aa-ItemActions">
                  <button
                    type="button"
                    className="aa-ItemActionButton"
                    title={`Fill query with "${item.title}"`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onTapAhead(item);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{width: 10}}>
                      <path d="M8 17v-7.586l8.293 8.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-8.293-8.293h7.586c0.552 0 1-0.448 1-1s-0.448-1-1-1h-10c-0.552 0-1 0.448-1 1v10c0 0.552 0.448 1 1 1s1-0.448 1-1z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          },
          noResults() {
            return 'No products for this query.';
          },
        },
      };
    },
  });
}
