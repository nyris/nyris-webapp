import React from 'react';
import AuthProvider from 'providers/AuthProvider';
import AppRouter from 'routes/Router';

import { algoliasearch } from 'algoliasearch';
import { InstantSearch } from 'react-instantsearch';

function App() {
  const algoliaClient = algoliasearch(
    window.settings.algolia.appId,
    window.settings.algolia.apiKey,
  );

  return (
    <AuthProvider>
      <InstantSearch
        initialUiState={{ searchState: { query: 'test' } }}
        future={{ preserveSharedStateOnUnmount: true }}
        searchClient={{
          ...algoliaClient,
          search(requests) {
            if (
              requests?.every(({ params }) => !params.query && !params.filters)
            ) {
              return Promise.resolve({
                results: requests.map(() => ({
                  a: false,
                  hits: [],
                  nbHits: 0,
                  nbPages: 0,
                  page: 0,
                  processingTimeMS: 0,
                  hitsPerPage: 0,
                  exhaustiveNbHits: false,
                  query: '',
                  params: '',
                })),
              });
            }
            return algoliaClient.search(requests);
          },
        }}
        indexName={window.settings.algolia.indexName}
      >
        <AppRouter />
      </InstantSearch>
    </AuthProvider>
  );
}

export default App;
