import React from 'react';
import {Result as ResultData} from "../types";

// TODO this needs refactoring: Make it one block with parameters for first line, second line, image url ..

interface Options {
    result: any,
    noImageUrl: string,
    onImageClick: () => void,
    onLinkClick: () => void
}

const renderDefault = ({result, noImageUrl, onImageClick, onLinkClick}: Options) => {

    const price = result.p ? '' + (result.p.vi / 100).toFixed(2) + ' ' + result.p.c : '';
    return (
        <>
            <a href={result.l} className="imageLink" title="Click the image so see similar products"
               onClick={onImageClick}
               onAuxClick={onLinkClick} >
                <div className="prdctImg">
                    <div className="imgWrap"><img
                        src={result.img && (result.img.url + '?r=512x512' || noImageUrl) }
                                                  crossOrigin="anonymous" alt=""/></div>
                </div>
            </a>
            <div className="prdctDetailsWrap">
                <div>
                    <div className="prdctTitle">{result.title}</div>
                    <div className="prdctMeta">
                        <span className="prdctPrice">{price}</span>
                        <span className="prdctShop"> at {result.mer}</span>
                    </div>
                    <a onClick={onLinkClick} onAuxClick={onLinkClick} className="prdctShopLink" href={result.l} target="_blank" rel="noopener noreferrer">Buy Now</a>
                </div>
            </div>
        </>);
};

const renderSnr = ({result, noImageUrl, onImageClick, onLinkClick}: Options) => (
    <>
        <a href={result.l} className="imageLink" onClick={onImageClick} onAuxClick={onLinkClick}>
                <div className="prdctImg">
                <div className="imgWrap"><img
                     src={result.img && (result.img.url + '?r=512x512' || noImageUrl) }
                     crossOrigin="anonymous" alt=""/>
        </div>
        </div>
        </a>
        <div className="prdctDetailsWrap">
            <div>
                <div className="prdctTitle">{result.sku}</div>
                <div className="prdctMeta" style={{height: '5em', whiteSpace: 'normal'}}>
                    {result.title}
                </div>
                <a style={{backgroundImage: 'none', paddingLeft: '10px'}} className="prdctShopLink" href={result.l} target="_blank" rel="noopener noreferrer"
                onClick={onLinkClick} onAuxClick={onLinkClick}>Info</a>
            </div>
        </div>
    </>
);

const renderSnrMultilink = ({result, noImageUrl, onImageClick, onLinkClick}: Options) => (
    <>
        <a href={result.l} className="imageLink"
           onClick={onImageClick} onAuxClick={onLinkClick}>
                <div className="prdctImg">
                <div className="imgWrap"><img
                     src={result.img && (result.img.url + '?r=512x512' || noImageUrl) }
                     crossOrigin="anonymous" alt=""/>
        </div>
        </div>
        </a>
        <div className="prdctDetailsWrap">
            <div>
                <div className="prdctTitle">{result.sku}</div>
                <div className="prdctMeta" style={{height: '5em', whiteSpace: 'normal'}}>
                    {result.title}
                </div>
                { result.l.map((l:{text: string, href: string}) =>
                <a style={{backgroundImage: 'none', paddingLeft: '10px'}} className="prdctShopLink" href={l.href} onClick={onLinkClick} onAuxClick={onLinkClick} target="_blank" rel="noopener noreferrer">{ l.text }</a>
                ) }
        </div>
        </div>
    </>
);

export interface ResultProps {
    result: any,
    style: any,
    template?: string,
    onImageClick: (pos: number, url: string) => void,
    onLinkClick: (pos: number, url: string) => void,
    noImageUrl?: string
}

const Result : React.FC<ResultProps> = ({result, style, template, onImageClick, onLinkClick, noImageUrl}) => {
    let options: Options = {
        onImageClick: () => onImageClick(result.position,  result.img.url),
        onLinkClick: () => onLinkClick(result.position, result.l),
        noImageUrl: noImageUrl || 'images/ic_cam_large_noimage.png',
        result
    };

    let resultInner = null;
    switch (template) {
        case "snr":
            resultInner = renderSnr(options);
            break;
        case "snr-multilink":
            resultInner = renderSnrMultilink(options);
            break;
        case 'default':
        default:
            resultInner = renderDefault(options);
            break;
    }

    return (
        <div className="prdctItem" style={{...style}}>
            { resultInner }
        </div>
    );
};


export default Result;
