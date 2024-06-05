import React, { useEffect, useMemo, useState } from "react";
import { RectCoords } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import { ReactComponent as CTAIcon } from "../assets/link.svg";
import { groupFiltersByFirstLetter } from "../Helpers";
import { ReactComponent as KeyboardArrowRightOutlinedIcon } from "../assets/arrow_right.svg";
import { ReactComponent as KeyboardArrowLeftOutlinedIcon } from "../assets/arrow_left.svg";
import { reorderProducts } from "../utils/reorderProducts";
import { getObjectValues } from "../utils/getObjValues";

import { useHistory } from "react-router-dom";
import Chat from "./Chat";
import { Chat as ChatType } from "../types";

interface IResultProps {
  results: any[];
  searchImage: any;
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
}: IResultProps) {
  const history = useHistory();

  const groupedFilters = groupFiltersByFirstLetter(preFilters);
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true);
  const [products, setProducts] = useState(results);
  const [showNewResultButton, setShowNewResultButton] = useState(false);

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

  const ocrList = useMemo(() => {
    if (ocr) {
      return getObjectValues(ocr);
    }
    return [];
  }, [ocr]);

  if (!searchImage) {
    history.push("/");
  }

  return (
    <section className="results">
      <aside className={`side-panel ${isSidePanelExpanded ? "expanded" : ""}`}>
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
                onSelectionChange={(r: RectCoords) => onSelectionChange(r)}
                image={searchImage}
                selection={{ x1: 0, x2: 1, y1: 0, y2: 1 }}
                regions={[]}
                minWidth={100 * (searchImage?.width / searchImage?.height)}
                minHeight={80}
                maxWidth={255}
                maxHeight={255}
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
            ocrList={ocrList}
            vizoLoading={vizoLoading}
            onUserQuery={onUserQuery}
            chatHistory={chatHistory}
            filters={filters}
            showNewResultButton={showNewResultButton}
            showRefinedResult={showRefinedResult}
            imageSearch={imageSearch}
          />

          <div className="results-product-list">
            {products.map((item, index) => (
              <div className="result-tile" key={index}>
                <div style={{ width: "192px", height: "192px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={item.image}
                      alt="image_item"
                      className="img-style product-image"
                      style={{
                        width: "98%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>

                <div className="result-tile-info">
                  <div className="result-tile-title">{item.title}</div>
                  <div className="result-tile-sku">{item.sku}</div>
                  <div className="result-tile-brand">
                    <strong>Brand:</strong>
                    <br />
                    {item.brand}
                  </div>
                  {/* <div className="result-tile-brand">
                <strong>Group ID:</strong>
                <br />
                {item.groupId}
              </div> */}
                  {item.links?.main && (
                    <button
                      className="cta-button"
                      onClick={() => window.open(item.links.main, "_blank")}
                    >
                      Buy now
                      <CTAIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultsComponent;
