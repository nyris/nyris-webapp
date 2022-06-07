import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { connectStateResults } from "react-instantsearch-dom";
import ItemResult from "components/results/ItemResult";
import _ from "lodash";

interface Props {
  allSearchResults: any;
  handlerToggleModal: any;
  setOpenModalShare: any;
  setSearchStateInput: any;
  getUrlToCanvasFile: any;
  setLoading: any;
  sendFeedBackAction: any;
  moreInfoText: any;
}

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
    if (!allSearchResults?.hits) {
      setItemShowDefault([]);
      return;
    }
    const listHistDefaultGroups = setListHitDefault(allSearchResults?.hits);
    setItemShowDefault(listHistDefaultGroups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSearchResults?.hits]);

  const setListHitDefault = (hits: any) => {
    let newArrayShowGroup: any = [];
    let newArrayShowItem: any = [];
    const groupHits = _.groupBy(hits, "group_id");
    setHitGroups(groupHits);
    newArrayShowGroup = Object.values(groupHits);
    newArrayShowGroup.forEach((item: any) => {
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
    return newArrayShowItem;
  };

  const handlerGroupItem = (hit: any, index: number) => {
    const group_id = hit.group_id;
    let newItemList = [...itemShowDefault];
    const firstArr = newItemList.slice(0, index + 1);
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
    let secondArr = newItemList.slice(index + 1, newItemList.length);
    secondArr = secondArr.filter((item) => item.group_id !== group_id);
    setItemShowDefault(firstArr.concat(secondArr));
  };

  return (
    <>
      {isLoading && (
        <Box className="box-wrap-loading">
          <Box className="loadingSpinCT">
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}

      {!itemShowDefault ? (
        <Box>No item to show</Box>
      ) : (
        itemShowDefault.map((hit: any, i: number) => {
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
              onSearchImage={(url: string) => {
                setSearchStateInput({});
                getUrlToCanvasFile(url);
                setLoading(true);
              }}
              handlerFeedback={(value: string) => {
                sendFeedBackAction(value);
              }}
              handlerGroupItem={() => handlerGroupItem(hit, i)}
              handlerCloseGroup={() => handlerCloseGroup(hit, i)}
              isGroupItem={hit?.isGroup}
              moreInfoText={moreInfoText}
            />
          );
        })
      )}
    </>
  );
}
const LoadingScreenCustom = connectStateResults<Props>(LoadingScreen);

export default LoadingScreenCustom;
