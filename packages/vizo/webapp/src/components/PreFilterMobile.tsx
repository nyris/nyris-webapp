import classNames from "classnames";

import { useState } from "react";
import { ReactComponent as IconFilter } from "../assets/filter_settings.svg";
import PreFilterModal from "./PreFilterModal";

interface ISelectModalPopup {
  setPreFilters: (prefilters: string[]) => void;
  selectedPreFilters: any;
}

function PreFilterMobile(props: ISelectModalPopup) {
  const { setPreFilters, selectedPreFilters } = props;
  const [showModal, setShowModal] = useState(false);

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
      <button
        className={classNames([
          "min-w-8",
          "min-h-8",
          "rounded-3xl",
          "flex",
          "justify-center",
          "items-center",
          "bg-[#F3F3F5]",
          "relative",
        ])}
        onClick={() => modalToggle(true)}
        title="pre-filter"
      >
        <div
          className={classNames([
            selectedPreFilters.length > 0 ? "block" : "hidden",
            "absolute",
            "top-0",
            "right-0",
            "w-2.5",
            "min-w-2.5",
            "h-2.5",
            "bg-[#3E36DC]",
            "border-2",
            "border-white",
            "rounded-full",
          ])}
        />
        <IconFilter
          className={classNames(
            selectedPreFilters.length > 0 ? "text-[#3E36DC]" : "text-black"
          )}
        />
      </button>
      <PreFilterModal
        modalToggle={modalToggle}
        setSelectedPreFilters={setPreFilters}
        selectedPreFilters={selectedPreFilters}
        showModal={showModal}
        animation={true}
        modalClassNames={"md:hidden"}
      />
    </>
  );
}

export default PreFilterMobile;
