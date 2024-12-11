import React, { useEffect, useState } from 'react';

import { ReactComponent as CloseButton } from '../images/close.svg';
import { useFilter } from '../hooks/useFilter';
import { onFilterCheck } from '../utils';
import translations from '../translations';

const translation = translations(window.nyrisSettings.language);

function PostFilter({
  onClose,
  postFilter,
  setPostFilter,
  results,
}: {
  onClose: () => void;
  postFilter: any;
  setPostFilter: any;
  results: any;
}) {
  const [checkedFilters, setCheckedFilters] = useState<any>({});
  const allFilter = useFilter(results, checkedFilters);

  useEffect(() => {
    setCheckedFilters(postFilter);
  }, [postFilter]);

  return (
    <div className="nyris__postFilter">
      <div className="nyris__postFilter-body">
        <div
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            margin: '0px 0px 0px 12px',
            alignSelf: 'end',
          }}
          onClick={() => onClose()}
        >
          <CloseButton width={12} color="#2B2C46" />
        </div>
        <div className="nyris__postFilter-heading">
          {translation['Refine your search results']}
        </div>
        <div style={{ overflowY: 'auto', paddingBottom: '24px' }}>
          {window.nyrisSettings.filter?.slice(0, 2).map((value, index) => {
            const filterList = allFilter?.[value.field];
            return (
              <div
                key={value.field}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginTop: '21px',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{value.label}</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '16px',
                    marginBottom: '8px',
                  }}
                >
                  {filterList?.map((item: any, index: number) => {
                    return (
                      <label
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          columnGap: '4px',
                          width: 'fit-content',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          className="nyris__postFilter-checkbox"
                          type="checkbox"
                          onChange={() => {
                            setCheckedFilters(
                              onFilterCheck(
                                {
                                  [value.field]: item.value,
                                },
                                checkedFilters,
                              ),
                            );
                          }}
                          checked={(() => {
                            if (checkedFilters[value.field]) {
                              return checkedFilters[value.field][item.value];
                            }
                            return false;
                          })()}
                        />

                        <div style={{ fontSize: '14px', paddingTop: '3px' }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: '14px', paddingTop: '3px' }}>
                          ({item.count})
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="nyris__postFilter-button-section">
        <div
          className="nyris__postFilter-button-cancel"
          onClick={() => {
            onClose();
          }}
        >
          {translation['Cancel']}
        </div>
        <div
          className="nyris__postFilter-button-apply"
          onClick={() => {
            setPostFilter(checkedFilters);
            onClose();
          }}
        >
          {translation['Apply']}
        </div>
      </div>
    </div>
  );
}

export default PostFilter;
