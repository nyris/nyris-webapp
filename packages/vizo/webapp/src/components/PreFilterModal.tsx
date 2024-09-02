import classNames from "classnames";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as SearchIcon } from "../assets/icon_search.svg";
import { ReactComponent as IconClose } from "../assets/close.svg";
import NyrisAPI, { NyrisAPISettings } from "@nyris/nyris-api";
import { groupFiltersByFirstLetter } from "../Helpers";
import { createPortal } from "react-dom";

function PreFilterModal({
  modalToggle,
  setSelectedPreFilters,
  selectedPreFilters,
  showModal,
  animation,
  modalClassNames,
}: {
  modalToggle: any;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
  showModal?: boolean;
  animation?: boolean;
  modalClassNames?: string;
}) {
  const [groupedFilters, setGroupedFilters] = useState<any>();
  const [searchKey, setSearchKey] = useState<string>("");
  const [preFilters, setPreFilters] = useState<any>();

  const settings = {
    apiKey: window.settings.apiKey,
  } as NyrisAPISettings;
  const nyrisApi = new NyrisAPI({ ...settings });

  const getPreFilters = useCallback(async () => {
    const resp = await nyrisApi.getFilters(1000);
    const filterdPreFilters = resp.filter(
      (itemResp) => itemResp.key === window.settings.preFilterKey
    )[0];
    return filterdPreFilters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchKey && preFilters) {
      const updatedFilters: any = preFilters?.filter((itemValue: any) => {
        return itemValue.toLowerCase().includes(searchKey.toLowerCase());
      });
      setGroupedFilters(groupFiltersByFirstLetter(updatedFilters));
    }
  }, [preFilters, searchKey]);

  useEffect(() => {
    if (showModal) {
      getPreFilters().then((res) => {
        setGroupedFilters(groupFiltersByFirstLetter(res.values));
        setPreFilters(res.values);
      });
    }
  }, [getPreFilters, showModal]);

  const modalRef = useRef<any>(null);

  useEffect(() => {
    if (animation) {
      modalRef.current?.classList.add("hidden");
    }
  }, [animation]);

  useEffect(() => {
    if (!animation) return;

    if (showModal) {
      modalRef.current?.classList.remove("hidden", "animate-slideDown");
      modalRef.current?.classList.add("animate-slideUp");
    } else {
      modalRef.current?.classList.remove("animate-slideUp");
      modalRef.current?.classList.add("animate-slideDown");
      setTimeout(() => {
        modalRef.current?.classList.add("hidden");
      }, 300);
    }
  }, [animation, showModal]);

  return (
    <>
      {createPortal(
        <div
          className={`custom-modal ${modalClassNames}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPreFilters([]);
            modalToggle(false);
          }}
          ref={modalRef}
        >
          <div
            className={classNames([
              "custom-modal-body",
              "w-full",
              "md:w-[800px]",
              "h-full",
              "md:h-[480px]",
              "flex",
              "flex-col",
            ])}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700 }}>
                Select a model
              </div>
              <IconClose
                width={16}
                height={16}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPreFilters([]);

                  modalToggle(false);
                }}
              />
            </div>
            <div
              className={classNames([
                "custom-modal-body-content",
                "flex",
                "flex-col",
                "h-full",
                "md:h-[358px]",
              ])}
            >
              <div
                className={classNames([
                  "search-prefilter",
                  "w-full",
                  "md:w-[512px]",
                ])}
              >
                <SearchIcon fill="#55566B" width={18} />
                <input
                  type="text"
                  onChange={(e) => setSearchKey(e.target.value)}
                  value={searchKey}
                  placeholder="Search a machine"
                />
                {searchKey ? (
                  <IconClose
                    style={{ fontSize: 14, color: "#2B2C46" }}
                    onClick={() => setSearchKey("")}
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="selected-prefilters">
                {selectedPreFilters.map(
                  (selectedPreFilter: any, index: number) => (
                    <div className="selected-prefilters-item" key={index}>
                      {selectedPreFilter}
                      <IconClose
                        width={10}
                        height={10}
                        style={{ color: "#3E36DC" }}
                        onClick={() => {
                          setSelectedPreFilters(
                            selectedPreFilters.filter(
                              (selected: any) => selected !== selectedPreFilter
                            )
                          );
                        }}
                      />
                    </div>
                  )
                )}
                {selectedPreFilters.length ? (
                  <>
                    <div className="counter">
                      {`${selectedPreFilters.length} / 10`}
                    </div>
                    <div
                      className="clean-all"
                      onClick={() => setSelectedPreFilters([])}
                    >
                      Clean All
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
              <section className={classNames(["prefilters", "flex-1"])}>
                {groupedFilters &&
                  Object.keys(groupedFilters).map((sectionName) => (
                    <article key={sectionName} className="letter-section">
                      <div className="section-name">{sectionName}</div>
                      <div
                        className={classNames([
                          "filters-grid",
                          "flex",
                          "flex-col",
                          "md:grid",
                        ])}
                      >
                        {groupedFilters[sectionName].map(
                          (filter: any, index: number) => (
                            <div
                              key={index}
                              className={`grid-item ${
                                selectedPreFilters.includes(filter)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                if (selectedPreFilters.includes(filter)) {
                                  setSelectedPreFilters(
                                    selectedPreFilters.filter(
                                      (selected: any) => selected !== filter
                                    )
                                  );
                                } else if (selectedPreFilters.length < 10) {
                                  setSelectedPreFilters((prev: any) => [
                                    ...prev,
                                    filter,
                                  ]);
                                }
                              }}
                            >
                              {filter}
                            </div>
                          )
                        )}
                      </div>
                    </article>
                  ))}
              </section>
            </div>
            <footer>
              <button
                className="cancel"
                onClick={() => {
                  setSelectedPreFilters([]);
                  modalToggle(false);
                }}
              >
                Cancel
              </button>
              <button
                className="apply"
                onClick={() => {
                  modalToggle(false);
                  setPreFilters(selectedPreFilters);
                }}
              >
                Apply
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default PreFilterModal;
