import React from "react";
import link from "./images/link.svg";
import similar_search from "./images/similar_search.svg";

export interface ResultProps {
  title: string;
  sku: string;
  links: Record<string, string>;
  imageUrl: string;
  onSimilarSearch?: any;
}
export const Result = (r: ResultProps) => {
  return (
    <div className="nyris__success-multiple-result">
      <div className="nyris__success-multiple-result-box">
        <div className="nyris__product-image">
          <img src={r.imageUrl} width={"192px"} height={"192px"} />
          <div
            className="nyris__product-similar-search"
            onClick={() => r.onSimilarSearch(r.imageUrl)}
          >
            <img src={similar_search} width={"16px"} height={"16px"} />
          </div>
        </div>
        <div className="nyris__success-multiple-product-panel">
          <div className="nyris__product-sku">{r.sku}</div>
          <a className="nyris__product-cta" href={r.links.main} target="_blank">
            <div className="nyris__product-title">{r.title}</div>
            <img src={link} width={"16px"} height={"16px"} />
          </a>
        </div>
      </div>
    </div>
  );
};
