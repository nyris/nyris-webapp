import React, {useState} from 'react';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { ReactComponent as CTAIcon } from '../assets/link.svg';
import { groupFiltersByFirstLetter } from '../Helpers';
import { ReactComponent as KeyboardArrowRightOutlinedIcon } from '../assets/arrow_right.svg';
import { ReactComponent as KeyboardArrowLeftOutlinedIcon } from '../assets/arrow_left.svg';

interface IResultProps {
  results: any[];
  searchBar: React.ReactNode;
  searchImage: any;
  preFilters: string[];
  onSelectionChange: (r: RectCoords) => void;
}
function ResultsComponent(props: IResultProps) {
  const groupedFilters = groupFiltersByFirstLetter(props?.preFilters);
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(true);

  return props.searchImage ? 
    (
      <section className="results">
        <aside className={`side-panel ${isSidePanelExpanded ? 'expanded' : ''}`}>
          <div className="side-panel-expand-btn">
            {isSidePanelExpanded ? (
              <KeyboardArrowLeftOutlinedIcon onClick={() => setIsSidePanelExpanded(false)} />
            ) : (
              <KeyboardArrowRightOutlinedIcon onClick={() => setIsSidePanelExpanded(true)} />
            )}
          </div>
          {isSidePanelExpanded ? (
            <>
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
              {props?.preFilters ? (
                <section className="prefilters">
                  <div className="prefilters-title">Search criteria</div>
                  {Object.keys(groupedFilters).map((sectionName) => (
                    <article key={sectionName} className="letter-section">
                      <div className="section-name">{sectionName}</div>
                      <div className="prefilters-container">
                        {groupedFilters[sectionName].map((filter, index) => (
                          <div
                            key={index}
                            className="item-prefilter"
                          >
                            {filter}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </section>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </aside>
        <div className="results-main">
          {props.searchBar}
          <div className="results-container">
            {props.results
              .map((item) => (
                <div className="result-tile">
                  <img src={item.image} alt="result" />
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