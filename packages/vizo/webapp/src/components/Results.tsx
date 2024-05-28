import React, { useMemo, useState } from "react";
import { RectCoords } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import { ReactComponent as CTAIcon } from "../assets/link.svg";
import { groupFiltersByFirstLetter } from "../Helpers";
import { ReactComponent as KeyboardArrowRightOutlinedIcon } from "../assets/arrow_right.svg";
import { ReactComponent as KeyboardArrowLeftOutlinedIcon } from "../assets/arrow_left.svg";
import { reorderProducts } from "../utils/reorderProducts";
import { getObjectValues } from "../utils/getObjValues";

interface IResultProps {
  results: any[];
  searchBar: React.ReactNode;
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
}
function ResultsComponent({
  onSelectionChange,
  preFilters,
  results,
  searchBar,
  searchImage,
  vizoResultAssessment,
  ocr,
  vizoLoading,
}: IResultProps) {
  const groupedFilters = groupFiltersByFirstLetter(preFilters);
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true);

  const products = useMemo(() => {
    if (vizoResultAssessment && vizoResultAssessment.ocr && !vizoLoading) {
      console.log("sku retured from llm", { vizoResultAssessment });

      if (typeof vizoResultAssessment.result[0] === "object") {
        const res = vizoResultAssessment.result.map(
          (item: { sku: any }) => item.sku
        );
        return reorderProducts(res, results);
      } else {
        return reorderProducts(vizoResultAssessment.result, results);
      }
    }

    return results;
  }, [results, vizoResultAssessment, vizoLoading]);

  const ocrList = useMemo(() => {
    if (ocr) {
      return getObjectValues(ocr);
    }
    return [];
  }, [ocr]);

  return searchImage ? (
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
                minWidth={100 * (searchImage.width / searchImage.height)}
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
        {searchBar}
        <div style={{ display: "flex" }}>
          {ocrList.map((value, index) => {
            return <p key={index}>{`${index !== 0 ? `, ` : ""} ${value}`} </p>;
          })}
        </div>
        <div className="results-container">
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
                      width: "100%",
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
    </section>
  ) : (
    <></>
  );
}

export default ResultsComponent;
