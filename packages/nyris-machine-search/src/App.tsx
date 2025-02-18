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
        }}
        indexName={window.settings.algolia.indexName}
      >
        <AppRouter />
      </InstantSearch>
    </AuthProvider>
  );
}

export default App;
