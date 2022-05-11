import React from "react";
import PropTypes from "prop-types";
import { connectHits } from "react-instantsearch-dom";
import ItemResult from "components/results/ItemResult";

function Hits({
  hits,
  setDataResultToAlgolia,
  handlerToggleModal,
  setOpenModalShare,
  setSearchStateInput,
  getUrlToCanvasFile,
  setLoading,
  sendFeedBackAction,
}: any): JSX.Element {
  const handleSearch = () => {
    setDataResultToAlgolia(hits);
  };
  console.log("hitshits", hits);

  return (
    <>
      {handleSearch}
      {hits.map((hit: any, index: any) => {
        return (
          <ItemResult
            key={index}
            dataItem={hit}
            handlerToggleModal={() => {
              handlerToggleModal(hit);
            }}
            handlerToggleModalShare={() => setOpenModalShare(true)}
            indexItem={hit.__position}
            isHover={false}
            onSearchImage={(url: any) => {
              setSearchStateInput({});
              getUrlToCanvasFile(url);
              setLoading(true);
            }}
            handlerFeedback={(value: string) => {
              sendFeedBackAction(value);
            }}
          />
        );
      })}
    </>
  );
}

Hits.propTypes = {
  hits: PropTypes.arrayOf(PropTypes.object),
  objectIDs: PropTypes.arrayOf(PropTypes.string),
  setObjectIDs: PropTypes.func,
};

const CustomHits = connectHits(Hits);
export default CustomHits;
