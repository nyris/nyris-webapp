import React from 'react';

interface IResultProps {}
function ResultsComponent(props: IResultProps) {
  console.log(props);
  return (
    <section className="results-container">
      <aside>
        Preview and postfilters
      </aside>
      <div>
        Results
      </div>
    </section>
  )
}

export default ResultsComponent;