import React, { useCallback, useEffect, useState } from "react";
import { ReactComponent as SearchIcon } from "../assets/icon_search.svg";
import { ReactComponent as IconClose } from "../assets/close.svg";
import NyrisAPI, { NyrisAPISettings } from "@nyris/nyris-api";
import { groupFiltersByFirstLetter } from "../Helpers";
import { createPortal } from "react-dom";

function PreFilterModal({
  modalToggle,
  setSelectedPreFilters,
  selectedPreFilters,
}: {
  modalToggle: any;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
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
    getPreFilters().then((res) => {
      setGroupedFilters(groupFiltersByFirstLetter(res.values));
      setPreFilters(res.values);
    });
  }, [getPreFilters]);

  return (
    <>
      {createPortal(
        <div
          className="custom-modal"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPreFilters([]);
            modalToggle(false);
          }}
        >
          <div
            className="custom-modal-body"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPreFilters([]);
                  modalToggle(false);
                }}
              />
            </div>
            <div className="custom-modal-body-content">
              <div className="search-prefilter">
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
              <section className="prefilters">
                {groupedFilters &&
                  Object.keys(groupedFilters).map((sectionName) => (
                    <article key={sectionName} className="letter-section">
                      <div className="section-name">{sectionName}</div>
                      <div className="filters-grid">
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
