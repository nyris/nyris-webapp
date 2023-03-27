import { Box } from '@material-ui/core';
import ItemResult from 'components/results/ItemResult';
import { groupBy } from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import { useAppSelector } from 'Store/Store';
import { AppState } from 'types';

interface Props {
  allSearchResults: any;
  getUrlToCanvasFile: any;
  setLoading?: any;
  sendFeedBackAction: any;
  moreInfoText: any;
  requestImage?: any;
  searchQuery?: string;
}

function LoadingScreen({
  allSearchResults,
  getUrlToCanvasFile,
  sendFeedBackAction,
  moreInfoText,
  searchQuery,
  requestImage,
  isSearchStalled,
}: any): JSX.Element {
  const { search } = useAppSelector<AppState>((state: any) => state);
  const { loadingSearchAlgolia } = search;
  const [hitGroups, setHitGroups] = useState<any>({});
  const [itemShowDefault, setItemShowDefault] = useState<any[]>([]);
  const [algoliaRequest, setAlgoliaRequest] = useState(false);

  useEffect(() => {
    if (isSearchStalled) {
      setAlgoliaRequest(true);
    }
  }, [isSearchStalled]);

  useEffect(() => {
    if (!allSearchResults?.hits?.length) {
      setItemShowDefault([]);
      return;
    }
    setAlgoliaRequest(false);
    const listHistDefaultGroups = setListHitDefault(allSearchResults?.hits);
    setItemShowDefault(listHistDefaultGroups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSearchResults?.hits, search?.valueTextSearch]);

  const setListHitDefault = (hits: any) => {
    let newArrayShowGroup: any = [];
    let newArrayShowItem: any = [];

    const groupHits = hits.filter(
      (hit: { group_id: string }) => hit.group_id && hit.group_id !== '',
    );
    const groups = groupBy(groupHits, 'group_id');
    setHitGroups(groups);
    newArrayShowGroup = Object.values(groups);
    if (newArrayShowGroup.length === 0) {
      return hits;
    }
    newArrayShowGroup.forEach((item: any) => {
      let payload: any;
      if (item.length >= 2) {
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

  const renderItem = useMemo(() => {
    if (!requestImage && !search.valueTextSearch.query && !isSearchStalled) {
      return (
        <Box style={{ marginTop: '50px', width: '100%', textAlign: 'center' }}>
          Please upload an image or enter a keyword to search.
        </Box>
      );
    }
    if (
      itemShowDefault.length === 0 &&
      !loadingSearchAlgolia &&
      !isSearchStalled &&
      (algoliaRequest || requestImage)
    ) {
      return (
        <Box style={{ marginTop: '50px', width: '100%', textAlign: 'center' }}>
          No products were found matching your search criteria.
        </Box>
      );
    }
    return itemShowDefault.map((hit: any, i: number) => {
      return (
        <Box key={i}>
          <ItemResult
            dataItem={hit}
            indexItem={i}
            isHover={false}
            onSearchImage={(url: string) => {
              getUrlToCanvasFile(url);
            }}
            handlerFeedback={(value: string) => {
              sendFeedBackAction(value);
            }}
            handlerGroupItem={(hitItem: any, index: number) =>
              handlerGroupItem(hitItem, index)
            }
            handlerCloseGroup={(hitItem: any, index: number) =>
              handlerCloseGroup(hitItem, index)
            }
            isGroupItem={hit?.isGroup}
            moreInfoText={moreInfoText}
            main_image_link={hit['image(main_similarity)']}
          />
        </Box>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemShowDefault,
    searchQuery,
    requestImage,
    search.valueTextSearch,
    isSearchStalled,
    algoliaRequest,
    loadingSearchAlgolia,
  ]);

  return <>{renderItem}</>;
}

const LoadingScreenCustom = connectStateResults<Props>(memo(LoadingScreen));
export default LoadingScreenCustom;
