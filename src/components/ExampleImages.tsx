import React from 'react';

interface ExampleImagesProps {
    images: string[],
    onExampleImageClicked: (e: React.MouseEvent<HTMLImageElement>) => void
}

const ExampleImages : React.FC<ExampleImagesProps> = ({images, onExampleImageClicked}) => {
    if (images.length === 0) {
        return null;
    }
    return (
        <section className="useExampleImg">
            You can also try one of these pictures:
            <div className="exampleImages">
                <div className="exImagesWrap">
                    {/* note: crossOrigin has to be applied before src to work */}
                    {images.map((i) => (<img key={i} crossOrigin="anonymous" src={i} alt="" onClick={onExampleImageClicked}/>))}
                </div>
            </div>
        </section>
    );
};

export default ExampleImages;
