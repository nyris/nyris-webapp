import React from 'react';

const noImageUrl = "TODO";

const renderDefault = (result: any) => {

    const price = result.p ? '' + (result.p.vi / 100).toFixed(2) + ' ' + result.p.c : '';
    return (
        <div className="prdctItem">
            <a href={result.l} className="imageLink" title="Click the image so see similar products">
                <div className="prdctImg">
                    <div className="imgWrap"><img src={result.img && result.img.url + '?r=512x512' || noImageUrl }
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
                    <a className="prdctShopLink" href="{{result.l}}" target="_blank">Buy Now</a>
                </div>
            </div>
        </div>
    );
};

const renderFashion = (result: any) => (
    <div className="prdctItem" >
    <a href={result.l} className="imageLink">
        <div className="prdctImg">
            <div className="imgWrap"><img src={result.img && result.img.url  || noImageUrl } alt=""/></div>
        </div>
    </a>
    <div className="prdctDetailsWrap">
        <div>
            <div className="prdctTitle">{result.title}</div>
            <div className="prdctMeta">
                <span className="prdctPrice"/>
                <span className="prdctShop"/>
            </div>
        </div>
    </div>
    </div>
);

const renderGs = (result: any) => (
    <div className="prdctItem">
    <a href={result.l} className="imageLink" title="Click the image so see similar products">
    <div className="prdctImg">
        <div className="imgWrap"><img
             src={result.img && result.img.url + '?r=512x512' || noImageUrl }
             crossOrigin="anonymous" alt=""/></div>
    </div>
    </a>
    </div>
);

const renderSnr = (result: any) => (
    <div className="prdctItem">
    <a href={result.l} className="imageLink">
            <div className="prdctImg">
            <div className="imgWrap"><img
                 src={result.img && result.img.url + '?r=512x512' || noImageUrl }
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
            <a style={{backgroundImage: 'none', paddingLeft: '10px'}} className="prdctShopLink" href={result.l} target="_blank">Info</a>
        </div>
    </div>
    </div>
);

const renderSnrMultilink = (result: any) => (
    <div className="prdctItem">
    <a href="{{result.l}}" className="imageLink">
            <div className="prdctImg">
            <div className="imgWrap"><img
                 src={result.img && result.img.url + '?r=512x512' || noImageUrl }
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
            { result.l.map((l:any) =>
            <a style={{backgroundImage: 'none', paddingLeft: '10px'}} className="prdctShopLink" href={l.href} target="_blank">{ l.text }</a>
            ) }
    </div>
    </div>
    </div>
);




const Result = (props:any) => {
    switch (props.template) {
        default:
            return renderDefault(props);

    }

};


export default Result;
