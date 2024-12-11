import React from "react";
import spinner from "../images/spinner.svg";
import translations from "../translations";

const labels = translations(window.nyrisSettings.language);

export const LoadingSpinner = ({ description }: { description?: string }) => {
  return (
    <div className="nyris__main-content nyris__wait-wrapper">
      <div className="nyris__wait-spinner">
        <img src={spinner} width={66} height={66} />
      </div>

      {description && <div>{description}</div>}
    </div>
  );
};
