import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@material-ui/core";
import { connectStateResults } from "react-instantsearch-dom";
import ItemResult from "components/results/ItemResult";
import _ from "lodash";
import { useAppDispatch } from "Store/Store";
import { updateStatusLoading } from "Store/Search";

interface Props {
  allSearchResults: any;
  handlerToggleModal: any;
  setOpenModalShare: any;
  getUrlToCanvasFile: any;
  setLoading: any;
  sendFeedBackAction: any;
  moreInfoText: any;
}

function LoadingScreen({
  allSearchResults,
  handlerToggleModal,
  setOpenModalShare,
  getUrlToCanvasFile,
  setLoading,
  sendFeedBackAction,
  moreInfoText,
}: any): JSX.Element {
  const dispatch = useAppDispatch();
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
    firstArr.filter((item) => item.group_id === group_id)[0].collap = false;
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
    firstArr.filter((item) => item.group_id === group_id)[0].collap = true;
    let secondArr = newItemList.slice(index + 1, newItemList.length);
    secondArr = secondArr.filter((item) => {
      return item.group_id !== group_id;
    });
    setItemShowDefault(firstArr.concat(secondArr));
  };

  const renderItem = useMemo(() => {
    if (itemShowDefault.length === 0) {
      return;
    }
    return itemShowDefault.map((hit: any, i: number) => {
      return (
        <Box key={i}>
          <ItemResult
            dataItem={hit}
            handlerToggleModal={() => {
              handlerToggleModal(hit);
            }}
            handlerToggleModalShare={() => setOpenModalShare(true)}
            indexItem={i}
            isHover={false}
            onSearchImage={(url: string) => {
              getUrlToCanvasFile(url);
              dispatch(updateStatusLoading(true));
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
            main_image_link={hit?.main_image_link}
          />
        </Box>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemShowDefault]);

  return (
    <>
      {isLoading && (
        <Box className="box-wrap-loading">
          <Box className="loadingSpinCT">
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}

      {itemShowDefault.length === 0 ? <Box>No items to show.</Box> : renderItem}
    </>
  );
}
const LoadingScreenCustom = connectStateResults<Props>(LoadingScreen);

export default LoadingScreenCustom;
