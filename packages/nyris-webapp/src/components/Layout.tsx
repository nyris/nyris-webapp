import { Box } from '@material-ui/core';
import { MultipleQueriesQuery } from '@algolia/client-search';
import algoliasearch from 'algoliasearch/lite';
import { ReactNode } from 'components/common';
import React, { memo, useMemo, useState } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import { changeValueTextSearch } from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AlgoliaSettings, AppState } from '../types';
import './appMobile.scss';
import './common.scss';
import AppContainer from './AppContainer';

function Layout({ children }: ReactNode): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { valueTextSearch } = search;
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;

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
        return searchClient.search(requests);
      },
    };
  }, [apiKey, appId, indexName]);

  return (
    <Box position={'relative'} className="wrap-mobile">
      <InstantSearch
        indexName={indexName}
        searchClient={conditionalQuery}
        searchState={valueTextSearch}
        onSearchStateChange={state => {
          dispatch(changeValueTextSearch(state));
        }}
      >
        <AppContainer>{children}</AppContainer>
      </InstantSearch>
    </Box>
  );
}

export default memo(Layout);
