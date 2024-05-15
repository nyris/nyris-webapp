import React, {useState} from 'react';
import { ReactComponent as VizoIcon } from '../assets/Vizo.svg';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { Filter } from '@nyris/nyris-api';

interface ISelectModalPopup {
  preFilters: Filter;
}

function SelectModelPopup(props: ISelectModalPopup) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPreFilters, setSelectedPreFilters] = useState<any[]>([]);

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
      <button className="ask-vizo" onClick={() => modalToggle(true)}>
        <VizoIcon />
        All
      </button>
      {showModal &&
        createPortal(
          <div
            className="custom-modal"
            onClick={(e) => {
              e.stopPropagation();
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
                  modalToggle(false);
                }}
              />
              <div className="custom-modal-body-title">Select a model</div>
              <div className="custom-modal-body-content">
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
                  {props.preFilters?.values?.map(itemFilter => (
                    <div className="item-prefilter">
                      <input
                        type="checkbox"
                        value={itemFilter}
                        checked={selectedPreFilters.includes(itemFilter)}
                        onChange={() => {
                          if (selectedPreFilters.includes(itemFilter)) {
                            setSelectedPreFilters(selectedPreFilters.filter(selected => selected !== itemFilter));
                          } else {
                            setSelectedPreFilters(prev => [...prev, itemFilter]);
                          }
                        }}
                      />
                      {itemFilter}
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default SelectModelPopup;