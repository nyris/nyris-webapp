import React, { useMemo, useState } from 'react';

import { ReactComponent as CloseButton } from '../images/close.svg';
import { ReactComponent as Search } from '../images/search.svg';
import { LoadingSpinner } from './Loading';
import { pickBy } from 'lodash';

const maxFilter = 10;

function PreFilter({
  onClose,
  preFilter,
  loading,
  selectedPreFilters,
  setSelectedPreFilters,
  searchFilters,
  labels,
}: {
  onClose: () => void;
  preFilter: Record<string, string[]>;
  loading: boolean;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
  searchFilters: (value: string) => void;
  labels: any;
}) {
  const [keyFilter, setKeyFilter] = useState<Record<string, boolean>>(
    selectedPreFilters || {},
  );
  const [searchKey, setSearchKey] = useState<string>('');

  const selectedFilterCount = useMemo(
    () =>
      Object.keys(keyFilter).reduce((count, key) => {
        if (keyFilter[key] === true) {
          return count + 1;
        }
        return count;
      }, 0),
    [keyFilter],
  );

  const filterSearchHandler = async (value: any) => {
    searchFilters(value);
  };

  return (
    <div className="nyris__prefilter">
      <div className="nyris__prefilter-body">
        <div
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            margin: '0px 12px 0px 12px',
            alignSelf: 'end',
          }}
          onClick={() => onClose()}
        >
          <CloseButton width={12} color="#2B2C46" />
        </div>
        <div className="nyris__prefilter-heading">
          {window.nyrisSettings.searchCriteriaLabel}
        </div>
        <div className="nyris__prefilter-search">
          <Search width={16} height={16} color="#55566B" />
          <input
            className="nyris__prefilter-input"
            onChange={(e: any) => {
              filterSearchHandler(e.target.value);
              setSearchKey(e.target.value);
            }}
            value={searchKey}
            placeholder={labels['Search']}
          />
          {searchKey ? (
            <CloseButton
              width={12}
              color="#2B2C46"
              style={{
                marginRight: 12,
                cursor: 'pointer',
              }}
              onClick={() => {
                filterSearchHandler(null);
                setSearchKey('');
              }}
            />
          ) : (
            ''
          )}
        </div>

        {selectedFilterCount > 0 && (
          <div className="nyris__prefilter-selected-filter-section">
            <div className="nyris__prefilter-selected-filters">
              {Object.keys(keyFilter).map((key, index) => {
                if (!keyFilter[key]) return <></>;
                return (
                  <div
                    className="nyris__prefilter-selected-filter"
                    key={index}
                    style={{}}
                  >
                    <div>{key}</div>
                    <div
                      className="nyris__prefilter-selected-filter-remove"
                      onClick={() => {
                        setKeyFilter({ ...keyFilter, [key]: false });
                      }}
                    >
                      <CloseButton width={8} />
                    </div>
                  </div>
                );
              })}
              <p
                style={{ fontWeight: 'bold', color: '#000', margin: 0 }}
              >{`${selectedFilterCount}/${maxFilter}`}</p>
              <div
                className="nyris__prefilter-clear"
                style={{}}
                onClick={() => {
                  setKeyFilter({});
                }}
              >
                {labels['Clear all']}
              </div>
            </div>
          </div>
        )}

        {loading && Object.keys(preFilter).length == 0 && <LoadingSpinner />}

        <div className="nyris__prefilter-filters-section">
          {Object.keys(preFilter).map((key, index) => {
            return (
              <div className="nyris__prefilter-filters" key={key}>
                <div className="nyris__prefilter-filter-heading">{key}</div>
                {preFilter[key].map((value, index) => {
                  return (
                    <div
                      className={`nyris__prefilter-filter-value ${
                        keyFilter[value] ? 'selected' : ''
                      }`}
                      key={index + value}
                      onClick={() => {
                        if (selectedFilterCount < maxFilter) {
                          setKeyFilter({
                            ...keyFilter,
                            [value]: !keyFilter[value],
                          });
                        }
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {!loading && (
          <div className="nyris__prefilter-button-section">
            <div
              className="nyris__prefilter-button-cancel"
              onClick={() => {
                setKeyFilter({});
                onClose();
              }}
            >
              {labels['Cancel']}
            </div>
            <div
              className="nyris__prefilter-button-apply"
              onClick={() => {
                const preFilter = pickBy(keyFilter, value => !!value);
                setSelectedPreFilters(preFilter);
                onClose();
              }}
            >
              {labels['Apply']}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreFilter;
