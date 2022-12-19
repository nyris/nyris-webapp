import React from 'react';
import type { OnSelectParams } from '@algolia/autocomplete-core';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import type { AutocompleteQuerySuggestionsHit } from '@algolia/autocomplete-plugin-query-suggestions/dist/esm/types';
import type { SearchClient } from 'algoliasearch/lite';
import { Typography } from '@material-ui/core';

type PopularSearchesPluginCreatorParams = {
  searchClient: SearchClient;
  onSelect?: (params: OnSelectParams<AutocompleteQuerySuggestionsHit>) => void;
  indexName?: any;
  handerCloseModal?: any;
};

export function popularSearchesPluginCreator({
  searchClient,
  onSelect: customOnSelect,
  indexName,
  handerCloseModal,
}: PopularSearchesPluginCreatorParams) {
  return createQuerySuggestionsPlugin({
    searchClient,
    indexName: indexName,
    categoryAttribute: ['brand', 'keyword_0', 'custom_category'],
    getSearchParams({ state }) {
      return { hitsPerPage: 5 };
    },
    transformSource({ source, onTapAhead }) {
      return {
        ...source,
        onSelect(params) {
          if (typeof customOnSelect === 'function') {
            customOnSelect(params);
          }
        },
        templates: {
          header() {
            return (
              <div>
                <span className="aa-SourceHeaderTitle">Suggested searches</span>
              </div>
            );
          },
          item({ item }: any) {
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
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      onTapAhead(item);
                    }}
                  ></button>
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
