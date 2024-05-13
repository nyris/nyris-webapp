import React, { useState } from 'react';

interface IResultProps {
  results: any[];
}
function ResultsComponent(props: IResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [firstRow, setFirstRow] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  return (
    <section className="results">
      <div className="results-container">
        {props.results
          .slice(firstRow, firstRow + pageSize)
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
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </section>
  )
}

export default ResultsComponent;