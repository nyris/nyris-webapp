import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import link from '../images/link.svg';
import similar_search from '../images/similar_search.svg';

import Popup3D from '../Popup3D';
import { CadenasScriptStatus, ResultProps } from '../types';

interface ProductCardProps extends ResultProps {
  onSimilarSearch?: any;
  cadenasScriptStatus?: CadenasScriptStatus;
}

export const ProductCard = (r: ProductCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [bounding, setBounding] = useState<any>(null);

  const mountPoint = document.querySelector('#nyris-mount-point');
  const { cadenasAPIKey, productLinkBaseURL } = window.nyrisSettings;

  /**
   * Gets the product link URL.
   * If productLinkBaseURL is configured, constructs URL as baseURL + sku.
   * Otherwise, falls back to links.main from search results.
   */
  const getProductLink = (): string | undefined => {
    if (productLinkBaseURL && r.sku) {
      // Ensure baseURL ends with / if it doesn't already
      const baseURL = productLinkBaseURL.endsWith('/') 
        ? productLinkBaseURL 
        : `${productLinkBaseURL}/`;
      return `${baseURL}${r.sku}`;
    }
    return r.links?.main;
  };

  const getCTAURL = () => {
    // If metadata starts with 'search?', handle it as a special case
    if (r.metadata && r.metadata.startsWith('search?')) {
      const index = window.location.href.indexOf('/#/');
      return index !== -1
        ? `${window.location.href.substring(0, index + 3)}${r.metadata}`
        : window.location.href;
    }
    // Otherwise, use the product link (either baseURL + sku or links.main)
    return getProductLink();
  };

  return (
    <div className="nyris__success-multiple-result">
      <div className="nyris__success-multiple-result-box">
        <div style={{ position: 'relative' }}>
          {cadenasAPIKey ? (
            <div>
              <Popup3D
                resultDetails={r}
                cadenasScriptStatus={r.cadenasScriptStatus}
              />
            </div>
          ) : (
            ''
          )}
          <a
            href={getProductLink()}
            target={window.nyrisSettings.navigatePreference}
            className="nyris__product-image"
          >
            <img src={r.imageUrl} style={{}} />
          </a>
          <div
            className="nyris__product-similar-search"
            onClick={() => r.onSimilarSearch(r.imageUrl)}
          >
            <img src={similar_search} width={'16px'} height={'16px'} />
          </div>
        </div>
        <div className="nyris__success-multiple-product-panel">
          <div className="nyris__product-info">
            <div
              className="nyris__product-info-title"
              onMouseOver={e => {
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
              onMouseLeave={e => {
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
                mountPoint,
              )}
            <div className="nyris__product-info-sku">{r.sku}</div>
          </div>
          <a
            className="nyris__product-cta"
            href={getCTAURL()}
            target={window.nyrisSettings.navigatePreference}
            style={{
              backgroundColor: window.nyrisSettings.primaryColor || '#3E36DC',
            }}
          >
            <div className="nyris__product-button">
              {window.nyrisSettings.ctaButtonText}
            </div>
            {getProductLink() && <img src={link} width={'14px'} height={'14px'} />}
          </a>
        </div>
      </div>
    </div>
  );
};
