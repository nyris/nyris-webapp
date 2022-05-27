import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { connectStateResults } from "react-instantsearch-dom";
import ItemResult from "components/results/ItemResult";
import _ from "lodash";

function LoadingScreen({
  allSearchResults,
  handlerToggleModal,
  setOpenModalShare,
  setSearchStateInput,
  getUrlToCanvasFile,
  setLoading,
  sendFeedBackAction,
  moreInfoText,
}: any): JSX.Element {
  const [isLoading] = useState<boolean>(false);
  const [hitGroups, setHitGroups] = useState<any>({});
  const [itemShowDefault, setItemShowDefault] = useState<any[]>([]);

  useEffect(() => {
    if (allSearchResults?.hits) {
      const result = allSearchResults?.hits;
      let newArrayShowGroup: any = [];
      let newArrayShowItem: any = [];
      var valueArr = result.map(function (hit: any) {
        return hit.group_id;
      });

      const newArrayFilter = findDuplicates(valueArr);
      const toFindDuplicates = Array.from(new Set(newArrayFilter));

      if (!toFindDuplicates) {
        return;
      }
      const groupHits = _.groupBy(result, "group_id");
      setHitGroups(groupHits);

      Object.keys(hitGroups).forEach((key) => {
        newArrayShowGroup.push(hitGroups[key]);
      });
      newArrayShowGroup.forEach((item: any, index: any) => {
        let payload: any;
        if (item.length >= 2) {
          payload = {
            ...item[0],
            isGroup: true,
          };
          newArrayShowItem.push(payload);
        } else {
          payload = {
            ...item[0],
            isGroup: false,
          };
          newArrayShowItem.push(payload);
        }
      });
      setItemShowDefault(newArrayShowItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSearchResults?.hits]);

  const findDuplicates = (arr: any[]) => {
    let sorted_arr = arr.slice().sort();
    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] === sorted_arr[i]) {
        results.push(sorted_arr[i]);
      }
    }
    return results;
  };

  const hanlderGroupItem = (hit: any, index: any) => {
    const group_id = hit.group_id;
    let newItemList = [...itemShowDefault];
    const firstArr = newItemList.slice(0, index + 1);
    let secondArr = newItemList.slice(index + 1, newItemList.length);

    let otherItemsInGroup = [...hitGroups[group_id]];
    otherItemsInGroup.shift();
    secondArr = otherItemsInGroup.concat(secondArr);

    setItemShowDefault(firstArr.concat(secondArr));
  };

  const handlerCloseGroup = (hit: any, index: any) => {
    const group_id = hit.group_id;
    let newItemList = [...itemShowDefault];
    const firstArr = newItemList.slice(0, index + 1);
    let secondArr = newItemList.slice(index + 1, newItemList.length);
    secondArr = secondArr.filter((item) => item.group_id !== group_id);

    setItemShowDefault(firstArr.concat(secondArr));
  };

  const renderItemHit = useCallback(() => {
    if (!itemShowDefault) {
      return <Box>No item to show</Box>;
    } else {
      return itemShowDefault.map((hit: any, i: any) => {
        return (
          <ItemResult
            key={i}
            dataItem={hit}
            handlerToggleModal={() => {
              handlerToggleModal(hit);
            }}
            handlerToggleModalShare={() => setOpenModalShare(true)}
            indexItem={hit?.__position}
            isHover={false}
            onSearchImage={(url: any) => {
              setSearchStateInput({});
              getUrlToCanvasFile(url);
              setLoading(true);
            }}
            handlerFeedback={(value: string) => {
              sendFeedBackAction(value);
            }}
            handlerGroupItem={() => hanlderGroupItem(hit, i)}
            handlerCloseGroup={() => handlerCloseGroup(hit, i)}
            isGroupItem={hit?.isGroup}
            // moreInfoText={moreInfoText}
          />
        );
      });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemShowDefault]);
  // console.log('itemShowDefault', itemShowDefault);

  return (
    <>
      {isLoading && (
        <Box className="box-wrap-loading">
          <Box className="loadingSpinCT">
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}

      {renderItemHit()}
    </>
  );
}
const LoadingScreenCustom = connectStateResults<any>(LoadingScreen);
export default LoadingScreenCustom;
