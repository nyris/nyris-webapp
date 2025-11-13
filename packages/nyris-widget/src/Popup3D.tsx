import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ReactComponent as Box3dIcon } from "./images/3d.svg";
import { ReactComponent as IconClose } from "./images/close.svg";
import { ResultProps } from "./Components/Product";
import CadenasWebViewer from "./CadenasWebViewer";
import link from "./images/link.svg";
import { CadenasScriptStatus } from "./App";

const Popup3D = ({
  resultDetails,
  cadenasScriptStatus,
}: {
  resultDetails: ResultProps;
  cadenasScriptStatus?: CadenasScriptStatus;
}) => {
  const [showModal, setShowModal] = useState(false);
  const mountPoint = document.querySelector(".nyris__wrapper");
  const [status3dView, setStatus3dView] = useState<
    "loading" | "loaded" | "not-found" | undefined
  >("loading");

  /**
   * Gets the product link URL.
   * If productLinkBaseURL is configured, constructs URL as baseURL + sku.
   * Otherwise, falls back to links.main from search results.
   */
  const getProductLink = (): string | undefined => {
    const { productLinkBaseURL } = window.nyrisSettings;
    if (productLinkBaseURL && resultDetails.sku) {
      // Ensure baseURL ends with / if it doesn't already
      const baseURL = productLinkBaseURL.endsWith('/') 
        ? productLinkBaseURL 
        : `${productLinkBaseURL}/`;
      return `${baseURL}${resultDetails.sku}`;
    }
    return resultDetails.links?.main;
  };

  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  return (
    <>
      <div
        className="nyris__product-popur-3d"
        onClick={() => {
          modalToggle(true);
        }}
      >
        <Box3dIcon width={16} height={16} color={"#AAABB5"} />
      </div>

      {mountPoint &&
        showModal &&
        createPortal(
          <div
            className="nyris__custom-modal"
            onClick={(e) => {
              e.stopPropagation();
              modalToggle(false);
            }}
          >
            <div
              className="nyris__custom-modal-body"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconClose
                width={24}
                height={24}
                fill={"#2B2C46"}
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  modalToggle(false);
                }}
              />
              <CadenasWebViewer
                sku={resultDetails.sku}
                status3dView={status3dView}
                setStatus3dView={setStatus3dView}
                cadenasScriptStatus={cadenasScriptStatus}
                metadata={resultDetails.metadata}
              />
              <div className="nyris__custom-modal-body-info">
                <div className="nyris__custom-modal-body-info-title">
                  {resultDetails.title}
                </div>
                <div className="nyris__custom-modal-body-info-sku">
                  {resultDetails.sku}
                </div>
                <a
                  className="nyris__product-cta"
                  href={getProductLink()}
                  target={window.nyrisSettings.navigatePreference}
                  style={{
                    backgroundColor:
                      window.nyrisSettings.primaryColor || "#3E36DC",
                  }}
                >
                  <div className="nyris__product-button">
                    {window.nyrisSettings.ctaButtonText}
                  </div>
                  {getProductLink() && (
                    <img src={link} width={"14px"} height={"14px"} />
                  )}
                </a>
              </div>
            </div>
          </div>,
          mountPoint
        )}
    </>
  );
};

export default Popup3D;
