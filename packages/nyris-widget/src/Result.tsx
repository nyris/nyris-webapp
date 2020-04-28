import React from 'react';
import product_arrow from './images/product_arrow.svg';

export interface ResultProps {
    title: string
    price: string
    link: string
    imageUrl: string
}
export const Result = (r: ResultProps) => (
    <div className="nyris__success-multiple-result">
        <a className="nyris__success-multiple-result-box" href={r.link}>
            <div className="nyris__success-multiple-product-image" style={{backgroundImage: `url("${r.imageUrl}")`}}/>
            <div className="nyris__success-multiple-product-panel">
                <div className="nyris__success-title">{ r.title}</div>
                <div className="nyris__success-price">{r.price}</div>
                <div className="nyris__success-multiple-product-arrow">
                    <img src={product_arrow} width="38px" height="38px"/>
                </div>
            </div>
        </a>
    </div>
);

