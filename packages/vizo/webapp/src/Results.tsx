import React from 'react';

interface IResultProps {}
function ResultsComponent(props: IResultProps) {
  console.log(window.NyrisSettings);
  console.log(props);
  return (
    <div>Results Section</div>
  )
}

export default ResultsComponent;