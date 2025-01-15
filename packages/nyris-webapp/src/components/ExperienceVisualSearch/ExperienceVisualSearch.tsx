import { memo } from 'react';
import { useNavigate } from 'react-router';

import { useImageSearch } from 'hooks/useImageSearch';

import '../../styles/experienceVisualSearch.scss';

import { Icon } from '@nyris/nyris-react-components';

function ExperienceVisualSearch({
  experienceVisualSearchBlobs,
  onOpenChange,
}: {
  experienceVisualSearchBlobs: Blob[];
  onOpenChange: (e: any) => void;
}) {
  const { settings } = window;

  const navigate = useNavigate();

  const { singleImageSearch } = useImageSearch();

  const initiateVisualSearch = async (blob: string) => {
    singleImageSearch({ image: blob, settings }).then(() => {});
    navigate('/result');
  };

  return (
    <div
      className="custom-modal-body h-full w-full"
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <Icon
        name="close"
        style={{ fontSize: 24, color: '#55566B' }}
        className="close-icon cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          onOpenChange(false);
        }}
      />
      <div className="custom-modal-body-title">Experience Visual Search</div>
      <div className="custom-modal-body-subtitle">
        Start your visual search by selecting an image below.
      </div>
      <div className="custom-modal-body-content experience-visual-search-images">
        {new Array(4).fill(1).map((val, index) => {
          let itemImage: any;

          if (index <= experienceVisualSearchBlobs.length - 1) {
            itemImage = URL.createObjectURL(experienceVisualSearchBlobs[index]);
          }
          return (
            <div
              key={index}
              className="experience-visual-search-image-container"
              onClick={() => {
                if (itemImage) {
                  onOpenChange(false);
                  initiateVisualSearch(itemImage);
                }
              }}
            >
              <div
                className={`experience-visual-search-image ${
                  !itemImage ? 'animate-pulse bg-gray-200' : ''
                }`}
                style={{
                  backgroundImage: `url(${itemImage})`,
                }}
              />
              {itemImage && (
                <div className="box-icon-modal">
                  <Icon
                    name="search_image"
                    width={16}
                    height={16}
                    color={'#AAABB5'}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ExperienceVisualSearch);
