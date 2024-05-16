import React, {useEffect, useState} from 'react';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { Filter } from '@nyris/nyris-api';
import { ReactComponent as SearchIcon } from '../assets/icon_search.svg';
import { ReactComponent as IconFilter} from '../assets/filter_settings.svg';

const groupFiltersByFirstLetter = (filters: string[]) => {
  if (!filters) {
    return {};
  }
  const groupedStrings: { [key: string]: string[] } = {};

  filters.sort((a, b) => a.localeCompare(b)).forEach((str) => {
    const firstLetter = str[0].toUpperCase();
    if (!groupedStrings[firstLetter]) {
      groupedStrings[firstLetter] = [];
    }
    groupedStrings[firstLetter].push(str);
  });

  return groupedStrings;
};

interface ISelectModalPopup {
  preFilters: Filter;
  setPreFilters: (prefilters: string[]) => void;
}

function SelectModelPopup(props: ISelectModalPopup) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [groupedFilters, setGroupedFilters] = useState(groupFiltersByFirstLetter(props?.preFilters?.values));
  const [searchKey, setSearchKey] = useState<string>('')

  useEffect(() => {
    if (!props?.preFilters?.values?.length) {
      return;
    }
    if (!searchKey) {
      setGroupedFilters(groupFiltersByFirstLetter(props?.preFilters?.values));
    } else {
      const updatedFilters =
        props.preFilters.values.filter(itemValue => itemValue.toLowerCase().includes(searchKey.toLowerCase()));
      setGroupedFilters(groupFiltersByFirstLetter(updatedFilters));
    }
  }, [searchKey, props?.preFilters?.values]);
  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  return (
    <div>
      <button className="prefilter-button" onClick={() => modalToggle(true)}>
        <div className={`prefilter-button-icon-background ${selectedPreFilters.length ? 'selected' : ''}`}>
          {selectedPreFilters.length ? (
            <div  className="indicator"/>
          ) : (
            ''
          )}
          <IconFilter color="white" />
        </div>
      </button>
      {showModal &&
        createPortal(
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
              <CloseOutlinedIcon
                style={{ fontSize: 24, color: '#55566B' }}
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPreFilters([]);
                  modalToggle(false);
                }}
              />
              <div className="custom-modal-body-title">Select a model</div>
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
                    <CloseOutlinedIcon
                      style={{ fontSize: 16, color: '#2B2C46' }}
                      onClick={() => setSearchKey('')}
                    />
                  ) : (
                    ''
                  )}
                </div>
                <div className="selected-prefilters">
                  {selectedPreFilters.map(selectedPreFilter => (
                    <div className="selected-prefilters-item">
                      {selectedPreFilter}
                      <CloseOutlinedIcon
                        style={{ fontSize: 16, color: '#3E36DC' }}
                        onClick={() => {
                          setSelectedPreFilters(selectedPreFilters.filter(selected => selected !== selectedPreFilter))
                        }}
                      />
                    </div>
                  ))}
                </div>
                <section className="prefilters">
                  {Object.keys(groupedFilters).map((sectionName) => (
                    <article key={sectionName} className="letter-section">
                      <div className="section-name">{sectionName}</div>
                      <div className="filters-grid">
                        {groupedFilters[sectionName].map((filter, index) => (
                          <div
                            key={index}
                            className={`grid-item ${selectedPreFilters.includes(filter) ? 'selected' : ''}`}
                            onClick={() => {
                              if (selectedPreFilters.includes(filter)) {
                                setSelectedPreFilters(selectedPreFilters.filter(selected => selected !== filter));
                              } else {
                                setSelectedPreFilters(prev => [...prev, filter]);
                              }
                            }}
                          >
                            {filter}
                          </div>
                        ))}
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
                  }}
                >
                  Apply
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default SelectModelPopup;