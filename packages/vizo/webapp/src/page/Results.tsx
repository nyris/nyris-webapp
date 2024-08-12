import classNames from "classnames";

import React, { useEffect, useState } from "react";
import { RectCoords, Region } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import { groupFiltersByFirstLetter } from "../Helpers";
import { ReactComponent as KeyboardArrowRightOutlinedIcon } from "../assets/arrow_right.svg";
import { ReactComponent as KeyboardArrowLeftOutlinedIcon } from "../assets/arrow_left.svg";
import { reorderProducts } from "../utils/reorderProducts";

import { useHistory } from "react-router-dom";
import Chat from "../components/Chat";
import { Chat as ChatType } from "../types";
import ImagePreviewMobile from "../components/ImagePreviewMobile";
import ChatMobile from "../components/ChatMobile";
import ProductCard from "../components/ProductCard";

interface IResultProps {
  results: any[];
  searchImage: HTMLCanvasElement;
  preFilters: string[];
  onSelectionChange: (r: RectCoords) => void;
  vizoResultAssessment?: {
    filter: boolean;
    ocr: boolean;
    result: any;
  };
  vizoLoading: boolean;
  ocr?: any;
  imageThumb?: any;
  aiMessage?: string;
  onUserQuery: (text: string) => void;
  chatHistory: ChatType[];
  filters: string[];
  imageSearch?: any;
  regions: Region[];
  setIsCameraOpen: any;
  isCameraOpen: boolean;
  onImageRemove: any;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
  notification: boolean;
  setNotification: any;
  vizoLoadingMessage: string;
}

const isResultRefined = (skuInOrder: string[], products: any[]) => {
  if (skuInOrder.length !== products.length) return true;
  return skuInOrder.some((sku, index) => {
    return sku !== products[index].sku;
  });
};

function ResultsComponent({
  onSelectionChange,
  preFilters,
  results,
  searchImage,
  vizoResultAssessment,
  ocr,
  vizoLoading,
  imageThumb,
  onUserQuery,
  chatHistory,
  filters,
  imageSearch,
  regions,
  setIsCameraOpen,
  onImageRemove,
  setSelectedPreFilters,
  selectedPreFilters,
  notification,
  setNotification,
  vizoLoadingMessage,
}: IResultProps) {
  const history = useHistory();

  const groupedFilters = groupFiltersByFirstLetter(preFilters);
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true);
  const [products, setProducts] = useState(results);
  const [showNewResultButton, setShowNewResultButton] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState({
    x1: 0,
    x2: 1,
    y1: 0,
    y2: 1,
  });

  const showRefinedResult = () => {
    if (typeof vizoResultAssessment?.result[0] === "object") {
      const res = vizoResultAssessment?.result.map(
        (item: { sku: any }) => item.sku
      );
      setProducts(reorderProducts(res, results));
    } else {
      setProducts(reorderProducts(vizoResultAssessment?.result, results));
    }
    setShowNewResultButton(false);
  };

  useEffect(() => {
    setProducts(results);
  }, [results]);

  useEffect(() => {
    if (!vizoResultAssessment) {
      setShowNewResultButton(false);
      return;
    }

    if (
      vizoResultAssessment.result.length > 0 &&
      !vizoResultAssessment.filter &&
      vizoResultAssessment.ocr
    ) {
      if (typeof vizoResultAssessment?.result[0] === "object") {
        const res = vizoResultAssessment.result.map(
          (item: { sku: any }) => item.sku
        );
        const show = isResultRefined(res, results);
        setShowNewResultButton(show);
      } else {
        const show = isResultRefined(vizoResultAssessment?.result, results);
        setShowNewResultButton(show);
      }
    } else setShowNewResultButton(false);

    if (
      vizoResultAssessment.result.length > 0 &&
      !vizoResultAssessment.filter &&
      !vizoResultAssessment.ocr
    ) {
      showRefinedResult();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vizoResultAssessment, results]);

  useEffect(() => {
    setSelectedRegion({
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 1,
    });
  }, [searchImage]);

  if (!searchImage) {
    history.push("/");
  }

  return (
    <>
      <section className="results hidden md:flex">
        <aside
          className={`side-panel ${isSidePanelExpanded ? "expanded" : ""}`}
        >
          <div className="side-panel-expand-btn">
            {isSidePanelExpanded ? (
              <KeyboardArrowLeftOutlinedIcon
                onClick={() => setIsSidePanelExpanded(false)}
              />
            ) : (
              <KeyboardArrowRightOutlinedIcon
                onClick={() => setIsSidePanelExpanded(true)}
              />
            )}
          </div>
          {isSidePanelExpanded ? (
            <>
              <div className="preview-container">
                <Preview
                  onSelectionChange={(r: RectCoords) => {
                    setSelectedRegion(r);
                    onSelectionChange(r);
                  }}
                  image={searchImage}
                  selection={selectedRegion}
                  regions={regions}
                  dotColor={"#FBD914"}
                  minCropWidth={30}
                  minCropHeight={30}
                  rounded={true}
                />
              </div>
              {preFilters && Object.keys(groupedFilters).length > 0 ? (
                <section className="prefilters">
                  <div className="prefilters-title">Search criteria</div>
                  {Object.keys(groupedFilters).map((sectionName) => (
                    <article key={sectionName} className="letter-section">
                      <div className="section-name">{sectionName}</div>
                      <div className="prefilters-container">
                        {groupedFilters[sectionName].map((filter, index) => (
                          <div key={index} className="item-prefilter">
                            {filter}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </section>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
        </aside>
        <div className="results-main">
          <div className="results-container">
            <Chat
              imageThumb={imageThumb}
              ocrList={ocr}
              vizoLoading={vizoLoading}
              onUserQuery={onUserQuery}
              chatHistory={chatHistory}
              filters={filters}
              showNewResultButton={showNewResultButton}
              showRefinedResult={showRefinedResult}
              imageSearch={imageSearch}
              vizoLoadingMessage={vizoLoadingMessage}
            />

            <div className="results-product-list gap-6">
              {products.map((item, index) => (
                <ProductCard product={item} key={index} />
              ))}
            </div>

            {products.length === 0 && !vizoLoading && (
              <div className="flex h-full items-center justify-center">
                <p className="text-[#AAABB5]">No results.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="flex flex-1 flex-col mt-12 md:hidden">
        <ImagePreviewMobile
          requestImage={searchImage}
          imageSelection={selectedRegion}
          filteredRegions={regions}
          onImageRemove={onImageRemove}
          onSelection={(r: RectCoords) => {
            setSelectedRegion(r);
            onSelectionChange(r);
          }}
        />
        <div
          className={classNames([
            "flex-1",
            "flex",
            "flex-col",
            "overflow-x-auto",
            "px-1",
          ])}
        >
          <div
            className={classNames([
              "flex",
              "flex-col",
              "w-full",
              "h-full",
              "gap-2",
              "mb-32",
            ])}
          >
            <div
              className={classNames([
                "w-full",
                "flex",
                "flex-row",
                "flex-wrap",
                "gap-2",
                "pb-4",
                "justify-center",
                "results-product-list",
              ])}
            >
              {products.map((item, index) => (
                <ProductCard product={item} key={index} />
              ))}
            </div>
            {products.length === 0 && !vizoLoading && (
              <div className="flex h-full items-center justify-center">
                <p className="text-[#AAABB5]">No results.</p>
              </div>
            )}
          </div>
        </div>
        <ChatMobile
          imageThumb={imageThumb}
          ocrList={ocr}
          vizoLoading={vizoLoading}
          onUserQuery={onUserQuery}
          chatHistory={chatHistory}
          filters={filters}
          showNewResultButton={showNewResultButton}
          showRefinedResult={showRefinedResult}
          imageSearch={imageSearch}
          setIsCameraOpen={setIsCameraOpen}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
          notification={notification}
          setNotification={setNotification}
          vizoLoadingMessage={vizoLoadingMessage}
        />
      </div>
    </>
  );
}

export default ResultsComponent;
