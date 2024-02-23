import React, { useState } from 'react';
import link from './images/link.svg';
import similar_search from './images/similar_search.svg';
import { createPortal } from 'react-dom';

export interface ResultProps {
  title: string;
  sku: string;
  links: Record<string, string>;
  imageUrl: string;
  onSimilarSearch?: any;
}
export const Result = (r: ResultProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [bounding, setBounding] = useState<any>(null);
  const mountPoint = document.querySelector('#nyris-mount-point');
  return (
    <div className="nyris__success-multiple-result">
      <div className="nyris__success-multiple-result-box">
        <div style={{ position: "relative" }}>
          <a
            href={r.links?.main}
            target="_blank"
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
          <div
              className="nyris__product-title"
              onMouseOver={(e) => {
                let right = document.body.clientWidth -
                        (e.target as HTMLElement).getBoundingClientRect().right -
                        (e.target as HTMLElement).getBoundingClientRect().width / 2;
                right = right > 0 ? right : 16;
                
                setBounding({
                  right,
                  bottom:
                      (mountPoint?.getBoundingClientRect()?.bottom || 0) -
                      (e.target as HTMLElement).getBoundingClientRect().bottom + 20,
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
                )
          }
          <div className="nyris__product-sku">{r.sku}</div>
            <a
              className="nyris__product-cta"
              href={r.links?.main}
              target="_blank"
              style={{ backgroundColor: window.nyrisSettings.primaryColor || '#3E36DC' }}
            >
              <div className="nyris__product-button">{window.nyrisSettings.ctaButtonText}</div>
              {r.links?.main && (
                <img src={link} width={"14px"} height={"14px"} />
              )}
            </a>
        </div>
      </div>
    </div>
  );
};
