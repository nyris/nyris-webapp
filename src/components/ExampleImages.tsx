import React from 'react';

const ExampleImages = ({imgs, onExampleImageClicked}: {imgs: string[], onExampleImageClicked: (e: React.MouseEvent) => void}) => {
    if (imgs.length === 0) {
        return null;
    }
    return (
        <section className="useExampleImg">
            You can also try one of these pictures:
            <div className="exampleImages">
                <div className="exImagesWrap">
                    {imgs.map((i) => (<img key={i} src={i} alt="" onClick={onExampleImageClicked} crossOrigin="anonymous"/>))}
                </div>
            </div>
        </section>
    );
};

export default ExampleImages;
