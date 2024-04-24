import React, { memo, useMemo } from 'react';
import { MultipleQueriesQuery } from '@algolia/client-search';
import algoliasearch from 'algoliasearch/lite';
import { ReactNode } from 'components/common';
import { InstantSearch } from 'react-instantsearch-dom';
import { changeValueTextSearch } from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AlgoliaSettings } from 'types';

function InstantSearchProvider({ children }: ReactNode): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector(state => state);
  const { valueTextSearch } = search;
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const isAlgoliaEnabled = settings.algolia?.enabled;

  const conditionalQuery = useMemo(() => {
    const searchClient = algoliasearch(appId, apiKey);
    searchClient.initIndex(indexName);
    return {
      ...searchClient,
      search(requests: MultipleQueriesQuery[]) {
        if (
          requests.every(
            (request: MultipleQueriesQuery) =>
              !request.params?.query &&
              (!request.params?.filters ||
                request.params?.filters.endsWith('<score=1>')),
          )
        ) {
          // Here we have to do something else
          return Promise.resolve({
            results: requests.map(() => ({
              hits: [],
              nbHits: 0,
              nbPages: 0,
              processingTimeMS: 0,
            })),
          });
        }
        if (isAlgoliaEnabled) {
          return searchClient.search(requests);
        }
      },
    };
  }, [apiKey, appId, indexName, isAlgoliaEnabled]);

  return (
    <div style={{ position: 'relative' }}>
      <InstantSearch
        indexName={indexName}
        searchClient={conditionalQuery}
        searchState={isAlgoliaEnabled ? valueTextSearch : {}}
        onSearchStateChange={state => {
          if (state.page && state.query !== undefined && isAlgoliaEnabled) {
            dispatch(changeValueTextSearch(state));
          }
        }}
      >
        {children}
      </InstantSearch>
    </div>
  );
}

export default memo(InstantSearchProvider);
