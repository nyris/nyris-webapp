import preFilter from 'components/pre-filter';
import { debounce, find, isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import useRequestStore from 'Store/requestStore';
import {
  updateQueryText,
  updateStatusLoading,
  setSearchResults,
  setShowFeedback,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

export const useSearchOrRedirect = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { requestImages, regions } = useRequestStore(state => ({
    requestImages: state.requestImages,
    regions: state.regions,
  }));

  const settings = useAppSelector(state => state.settings);
  const isAlgoliaEnabled = settings.algolia?.enabled;

  const searchOrRedirect = useCallback(
    debounce((value: any) => {
      if (!isAlgoliaEnabled) {
        dispatch(updateQueryText(value));
        let payload: any;
        let filters: any[] = [];
        const preFilterValues = [
          {
            key: settings.visualSearchFilterKey,
            values: Object.keys(preFilter),
          },
        ];
        if (value || requestImages.length > 0) {
          dispatch(updateStatusLoading(true));
          find({
            image: requestImages[0],
            settings,
            filters: !isEmpty(preFilter) ? preFilterValues : undefined,
            region: regions[0],
            text: value,
          })
            .then((res: any) => {
              res?.results.forEach((item: any) => {
                filters.push({
                  sku: item.sku,
                  score: item.score,
                });
              });
              payload = {
                ...res,
                filters,
              };
              dispatch(setSearchResults(payload));
              dispatch(updateStatusLoading(false));
              dispatch(setShowFeedback(true));
            })
            .catch((e: any) => {
              dispatch(updateStatusLoading(false));
            });
        } else {
          dispatch(setSearchResults([]));
        }
      }

      if (value) {
        history.push({
          pathname: '/result',
          search: `?query=${value}`,
        });
      } else {
        history.push('/result');
      }
    }, 500),
    [requestImages, preFilter, regions, isAlgoliaEnabled],
  );

  return searchOrRedirect;
};
