import { useAppSelector } from 'Store/Store';
import { useFilteredResult } from 'hooks/useFilteredResult';
import { groupBy, uniqueId } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

export const useProductList = ({ allSearchResults, isSearchStalled }: any) => {
  const { search, settings } = useAppSelector(state => state);
  const { valueTextSearch, results } = search || {};
  const { showGroup, algolia } = settings || {};
  const [itemShowDefault, setItemShowDefault] = useState<any[]>([]);
  const [algoliaRequest, setAlgoliaRequest] = useState(false);
  const [hitGroups, setHitGroups] = useState<any>({});

  const setListHitDefault = (hits: any) => {
    let newArrayShowGroup: any = [];
    let newArrayShowItem: any = [];

    const groupHits = hits.map((hit: { group_id: string }) => {
      if (!hit.group_id) {
        return { ...hit, group_id: uniqueId('random-group-id') };
      }
      return hit;
    });

    const groups = groupBy(groupHits, 'group_id');
    setHitGroups(groups);
    newArrayShowGroup = Object.values(groups);
    if (newArrayShowGroup?.length === 0) {
      return hits;
    }
    newArrayShowGroup.forEach((item: any) => {
      let payload: any;
      if (item?.length >= 2) {
        payload = {
          ...item[0],
          isGroup: true,
          collap: true,
        };
        newArrayShowItem.push(payload);
      } else {
        payload = {
          ...item[0],
          isGroup: false,
          collap: null,
        };
        newArrayShowItem.push(payload);
      }
    });

    return newArrayShowItem;
  };

  const handlerGroupItem = (hit: any, index: number) => {
    const group_id = hit.group_id;
    let newItemList = [...itemShowDefault];
    const firstArr = newItemList.slice(0, index + 1);
    firstArr.filter(item => item.group_id === group_id)[0].collap = false;
    let secondArr = newItemList.slice(index + 1, newItemList.length);
    let otherItemsInGroup = [...hitGroups[group_id]];
    otherItemsInGroup.shift();
    secondArr = otherItemsInGroup.concat(secondArr);
    setItemShowDefault(firstArr.concat(secondArr));
  };
  const handlerCloseGroup = (hit: any, index: number) => {
    const group_id = hit.group_id;
    let newItemList = [...itemShowDefault];
    const firstArr = newItemList.slice(0, index + 1);
    firstArr.filter(item => item.group_id === group_id)[0].collap = true;
    let secondArr = newItemList.slice(index + 1, newItemList.length);
    secondArr = secondArr.filter(item => {
      return item.group_id !== group_id;
    });
    setItemShowDefault(firstArr.concat(secondArr));
  };

  useEffect(() => {
    if (!allSearchResults?.hits?.length) {
      setItemShowDefault([]);
      return;
    }
    setAlgoliaRequest(false);
    const listHistDefaultGroups = showGroup
      ? setListHitDefault(allSearchResults?.hits)
      : allSearchResults?.hits;
    setItemShowDefault(listHistDefaultGroups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSearchResults?.hits, valueTextSearch]);

  useEffect(() => {
    if (isSearchStalled) {
      setAlgoliaRequest(true);
    }
  }, [isSearchStalled]);

  const filteredResult = useFilteredResult(results);

  const productList = useMemo(() => {
    return filteredResult?.map((item: any) => {
      return {
        ...item,
        main_image_link: item.image || item.images ? item.images[0] : '',
      };
    });
  }, [filteredResult]);

  return {
    productList: algolia?.enabled ? itemShowDefault : productList || [],
    handlerGroupItem,
    handlerCloseGroup,
    algoliaRequest,
    isLoading: false,
    hasError: false,
    errorMessage: '',
    loadProductList: () => {},
    reset: () => {},
  };
};
