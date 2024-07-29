import { useState } from "react";
import { ReactComponent as IconFilter } from "../assets/filter_settings.svg";
import PreFilterModal from "./PreFilterModal";

interface ISelectModalPopup {
  setPreFilters: (prefilters: string[]) => void;
  selectedPreFilters: any;
}

function SelectModelPopup(props: ISelectModalPopup) {
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
      <button className="prefilter-button" onClick={() => modalToggle(true)}>
        <div
          className={`prefilter-button-icon-background ${
            selectedPreFilters.length ? "selected" : ""
          }`}
        >
          {selectedPreFilters.length ? <div className="indicator" /> : ""}
          <IconFilter color="white" />
        </div>
        <div className="tooltip">Add or change pre-filter</div>
      </button>
      {showModal && (
        <PreFilterModal
          modalToggle={modalToggle}
          setSelectedPreFilters={setPreFilters}
          selectedPreFilters={selectedPreFilters}
          animation={false}
        />
      )}
    </>
  );
}

export default SelectModelPopup;
