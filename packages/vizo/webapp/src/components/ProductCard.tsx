import { ReactComponent as CTAIcon } from "../assets/link.svg";
import classNames from "classnames";
import { Tooltip } from "./Tooltip";

function ProductCard({ product }: { product: any }) {
  return (
    <div className="result-tile">
      <div style={{ width: "192px", height: "192px" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={product.image}
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
        <Tooltip content={product.title} enabled={product.title?.length > 25}>
          <div
            className={classNames([
              "text-xs",
              "font-bold",
              "leading-[17.09px]",
              "tracking-[0.2px]",
              "break-normal",
              "whitespace-nowrap",
              "overflow-hidden",
              "text-ellipsis",
              "w-44",
              "text-start",
            ])}
          >
            {product.title}
          </div>
        </Tooltip>
        <div className="result-tile-sku">{product.sku}</div>
        <div className="result-tile-brand">
          <strong>Brand:</strong>
          <br />
          {product.brand}
        </div>
        {product.links?.main && (
          <button
            className="cta-button"
            onClick={() => window.open(product.links.main, "_blank")}
          >
            Buy now
            <CTAIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
