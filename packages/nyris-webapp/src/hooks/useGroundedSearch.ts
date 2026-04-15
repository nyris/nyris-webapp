import { useCallback } from 'react';
import {
  groundedSearch,
  groundedSearchFilter,
  groundingSearchQuery,
} from 'services/vizo';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';

export const useGroundedSearch = () => {
  const setGoogleGroundingResponse = useResultStore(
    state => state.setGoogleGroundingResponse,
  );
  const setGroundingFilterResult = useResultStore(
    state => state.setGroundingFilterResult,
  );
  const setGroundingError = useResultStore(state => state.setGroundingError);
  const setIsGoogleGroundingLoading = useUiStore(
    state => state.setIsGoogleGroundingLoading,
  );

  const groundedSearchCallback = useCallback(
    (requestImage: File | HTMLCanvasElement, products: any[] = []) => {
      setIsGoogleGroundingLoading(true);
      //   setGroundingError('Unable to search the Internet.');
      setGroundingError(null);
      groundedSearch(requestImage, window.settings.aiApiKey || '')
        .then(groundingRes => {
          const groundingSpecs = {
            product_name: groundingRes.product_name,
            brand: groundingRes.brand,
            part_number: groundingRes.part_number,
            key_specs: groundingRes.key_specs,
          };

          groundedSearchFilter({
            products: products || [],
            groundingSummary: groundingRes?.grounding_summary || '',
            apiKey: window.settings.aiApiKey || '',
          })
            .then((filterRes: any) => {
              setGroundingFilterResult(filterRes?.matches || []);

              if (
                filterRes?.matches?.length === 0 &&
                window.settings.vizo?.fallbackToElasticSearch
              ) {
                groundingSearchQuery({
                  groundingSummary: JSON.stringify(groundingRes),
                  apiKey: window.settings.aiApiKey || '',
                }).then((queryRes: any) => {
                  useRequestStore.getState().setGroundingQuery(queryRes?.query);
                });
              }
            })
            .catch(error => {
              console.log('Grounding Filter API error:', error);
              setGroundingError('Unable to search the Internet.');
            })
            .finally(() => {
              setIsGoogleGroundingLoading(false);
            });

          setGoogleGroundingResponse(groundingSpecs);
        })
        .catch(error => {
          console.log('Grounding API error:', error);
          setGroundingError('Unable to search the Internet.');
        })
        .finally(() => {});
    },
    [
      setGoogleGroundingResponse,
      setGroundingFilterResult,
      setGroundingError,
      setIsGoogleGroundingLoading,
    ],
  );

  return { groundedSearch: groundedSearchCallback };
};
