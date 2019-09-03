import React from 'react';


const CategoryFilter = ({cats}: {cats: string[]}) => {
    if (cats.length === 0) {
        return null;
    }
    return (
        <div id="catlist" style={{'textAlign': 'center'}}>
            {
                cats.map((s) => <a key={s} href="#top">{s}</a>) // TODO fix link
            }
        </div>
    );
};

export default CategoryFilter;
