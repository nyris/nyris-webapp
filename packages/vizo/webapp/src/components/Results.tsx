import React, { useState } from 'react';
import { Filter, RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { ReactComponent as CTAIcon } from '../assets/link.svg';

interface IResultProps {
  results: any[];
  searchBar: React.ReactNode;
  searchImage: any;
  preFilters: Filter;
  onSelectionChange: (r: RectCoords) => void;
}
function ResultsComponent(props: IResultProps) {
  const [selectedPreFilters, setSelectedPreFilters] = useState<any[]>([]);

  return props.searchImage ? 
    (
      <section className="results">
        <aside className="side-panel">
          <div className="preview-container">
            <Preview
              onSelectionChange={(r: RectCoords) => props.onSelectionChange(r)}
              image={props.searchImage}
              selection={{ x1: 0, x2: 1, y1: 0, y2: 1 }}
              regions={[]}
              minWidth={100 * (props.searchImage.width / props.searchImage.height)}
              minHeight={80}
              maxWidth={255}
              maxHeight={255}
              dotColor={'#FBD914'}
              minCropWidth={30}
              minCropHeight={30}
              rounded={true}
            />
          </div>
          <section className="prefilters">
            {props.preFilters?.values?.map(itemFilter => (
              <div>
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
        </aside>
        <div className="results-main">
          {props.searchBar}
          <div className="results-container">
            {props.results
              .map((item) => (
                <div className="result-tile">
                  <img src={item.image} alt="result image" />
                  <div className="result-tile-info">
                    <div className="result-tile-title">{item.title}</div>
                    <div className="result-tile-sku">{item.sku}</div>
                    <div className="result-tile-brand">
                      <strong>Brand:</strong>
                      <br />
                      {item.brand}
                    </div>
                    <div className="result-tile-brand">
                      <strong>Group ID:</strong>
                      <br />
                      {item.groupId}
                    </div>
                    <button
                      className="cta-button"
                      onClick={() => window.open(item.links.main, '_blank')}
                    >
                      Buy now
                      <CTAIcon />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>
    ) : (
      <></>
    )
}

export default ResultsComponent;