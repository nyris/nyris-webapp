import React from 'react';

const PredictedCategories = ({cs}: {cs: {name: string, score: number}[]}) =>
    <>
        {cs.map((c) =>
            <small key={c.name}>
                {c.name === "" ? "No category" : c.name.split(" > ").slice(-1)[0]}:
                {(c.score * 100).toFixed(0)}%
            </small>)}
    </>
;


export default PredictedCategories;
