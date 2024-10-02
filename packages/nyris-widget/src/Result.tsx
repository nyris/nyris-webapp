import React, { useState } from "react";
import link from "./images/link.svg";
import similar_search from "./images/similar_search.svg";
import { createPortal } from "react-dom";
import Popup3D from "./Popup3D";
import { CadenasScriptStatus } from "./App";

export interface ResultProps {
  metadata: string;
  title: string;
  sku: string;
  links: Record<string, string>;
  imageUrl: string;
  onSimilarSearch?: any;
  cadenasScriptStatus?: CadenasScriptStatus;
}
export const Result = (r: ResultProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [bounding, setBounding] = useState<any>(null);
  const mountPoint = document.querySelector("#nyris-mount-point");
  const { cadenasAPIKey, cadenasCatalog } = window.nyrisSettings;
  return (
    <div className="nyris__success-multiple-result">
      <div className="nyris__success-multiple-result-box">
        <div style={{ position: "relative" }}>
          {!!cadenasAPIKey && !!cadenasCatalog ? (
            <div className="nyris__product-popur-3d">
              <Popup3D
                resultDetails={r}
                cadenasScriptStatus={r.cadenasScriptStatus}
              />
            </div>
          ) : (
            ""
          )}
          <a
            href={r.links?.main}
            target={window.nyrisSettings.navigatePreference}
            className="nyris__product-image"
          >
            <img src={r.imageUrl} style={{}} />
          </a>
          <div
            className="nyris__product-similar-search"
            onClick={() => r.onSimilarSearch(r.imageUrl)}
          >
            <img src={similar_search} width={"16px"} height={"16px"} />
          </div>
        </div>
        <div className="nyris__success-multiple-product-panel">
          <div className="nyris__product-info">
            <div
              className="nyris__product-info-title"
              onMouseOver={(e) => {
                let right =
                  document.body.clientWidth -
                  (e.target as HTMLElement).getBoundingClientRect().right -
                  (e.target as HTMLElement).getBoundingClientRect().width / 2;
                right = right > 0 ? right : 16;
                setBounding({
                  right,
                  bottom:
                    (mountPoint?.getBoundingClientRect()?.bottom || 0) -
                    (e.target as HTMLElement).getBoundingClientRect().bottom +
                    40,
                });
                setTimeout(() => {
                  setShowTooltip(true);
                }, 300);
              }}
              onMouseLeave={(e) => {
                setBounding(null);
                setShowTooltip(false);
              }}
            >
              {r.title}
            </div>
            {showTooltip &&
              bounding &&
              mountPoint &&
              createPortal(
                <div
                  className="custom-tooltip arrow-down"
                  style={{
                    bottom: bounding.bottom,
                    right: bounding.right,
                  }}
                >
                  {r.title}
                </div>,
                mountPoint
              )}
            <div className="nyris__product-info-sku">{r.sku}</div>
          </div>
          <a
            className="nyris__product-cta"
            href={r.links?.main}
            target={window.nyrisSettings.navigatePreference}
            style={{
              backgroundColor: window.nyrisSettings.primaryColor || "#3E36DC",
            }}
          >
            <div className="nyris__product-button">
              {window.nyrisSettings.ctaButtonText}
            </div>
            {r.links?.main && <img src={link} width={"14px"} height={"14px"} />}
          </a>
        </div>
      </div>
    </div>
  );
};
