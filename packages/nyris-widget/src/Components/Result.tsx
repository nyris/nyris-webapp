import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Preview } from '@nyris/nyris-react-components';
import { RectCoords } from '@nyris/nyris-api';

import { debounce } from 'lodash';

import crop from '../images/crop.svg';
import collapse from '../images/collapse.svg';

import { ReactComponent as GoBack } from '../images/path.svg';
import { ReactComponent as Filter } from '../images/filter.svg';
import { ReactComponent as Camera } from '../images/camera.svg';
import { ReactComponent as Close } from '../images/close.svg';
import { ReactComponent as Trash } from '../images/trash.svg';

import { LoadingSpinner } from './Loading';
import { ProductCard } from './Product';
import Feedback from './Feedback';
import Modal from './Modal';
import PostFilter from './PostFilter';
import { AppProps } from '../types';
import { useFilteredResult } from '../hooks/useFilteredResult';
import { useFilter } from '../hooks/useFilter';
import { onFilterCheck } from '../utils';
import { WebCameraModal } from './WebCameraModal';
import Inquiry from './Inquiry';
import { Icon } from '@nyris/nyris-react-components';

export const Result = ({
  onAcceptCrop,
  results,
  onSimilarSearch,
  image,
  regions,
  selection,
  onRestart,
  onFile,
  loading,
  onGoBack,
  firstSearchImage,
  cadenasScriptStatus,
  submitFeedback,
  feedbackStatus,
  setFeedbackStatus,
  selectedPreFilters,
  postFilter,
  setPostFilter,
  labels,
}: AppProps) => {
  const noResult = results.length === 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(selection);
  const [expand, setExpand] = useState(noResult);

  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const handleSubmitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);
    setFeedbackStatus('submitted');
    submitFeedback(data).then(() => {});
  };

  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      onAcceptCrop(r, selectedPreFiltersLabel);
    }, 500),
    [],
  );

  useEffect(() => {
    if (
      results?.length === 0 ||
      feedbackStatus === 'submitted' ||
      feedbackStatus === 'visible' ||
      !window.nyrisSettings.feedback
    ) {
      return;
    }

    const handleScroll = () => {
      setFeedbackStatus('visible');
    };

    window.addEventListener('scroll', handleScroll, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [feedbackStatus, results]);

  const selectedPreFiltersLabel = useMemo(
    () => Object.keys(selectedPreFilters),
    [selectedPreFilters],
  );

  const filteredProducts = useFilteredResult(results, postFilter);
  const allFilter = useFilter(results, postFilter);

  const selectedFilters = useMemo(() => {
    const selectedFilters: any[] = [];
    Object.keys(allFilter).forEach(key => {
      const values = allFilter[key];
      values.forEach((data: { value: string }) => {
        if (postFilter[key] && postFilter[key][data.value]) {
          selectedFilters.push({ key, ...data });
        }
      });
    });
    return selectedFilters;
  }, [allFilter, postFilter]);

  return (
    <>
      <div
        className="nyris__screen nyris__success-multiple"
        style={{
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="nyris__main-heading ">
          {noResult ? labels['Let’s try that again'] : labels['Success!']}
        </div>
        <div className={`nyris__main-description ${noResult ? 'no-results' : ''}`}>
          {noResult &&
            selectedPreFiltersLabel.length > 0 &&
            labels["We couldn't find matches based on <prefilters>"]({
              prefilters: selectedPreFiltersLabel.join(', '),
              style: 'bold',
            })}
          {noResult &&
            selectedPreFiltersLabel.length === 0 &&
            labels['We couldn’t find matches']}
          {/* {noResult && translation['For the best results, please use']} */}
          {!noResult && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 'bold' }}>{results.length}</div>
              <div>
                {results.length === 1
                  ? labels['match found']
                  : labels['matches found']}
              </div>
              {selectedPreFiltersLabel.length > 0 && (
                <>
                  <div>{labels['based on']}</div>
                  <div
                    style={{
                      paddingRight: '4px',
                      paddingLeft: '2px',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedPreFiltersLabel?.join(', ')}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div
          className={`nyris__main-content ${feedbackStatus === 'visible' ? 'w-feedback' : ''}`}
        >
          <div className="nyris__success-multiple-preview">
            <div className="nyris__success-multiple-preview-wrapper">
              <Preview
                image={image}
                selection={currentSelection}
                onSelectionChange={(r: any) => {
                  setCurrentSelection(r);
                  debouncedOnImageSelectionChange(r);
                }}
                regions={regions}
                minWidth={100 * (image.width / image.height)}
                minHeight={100}
                dotColor={expand ? '#FBD914' : ''}
                minCropWidth={expand ? 60 : 10}
                minCropHeight={expand ? 60 : 10}
                rounded={false}
                expandAnimation={expand}
                shrinkAnimation={!expand}
                onExpand={() => {
                  setExpand(true);
                }}
                showGrip={expand}
                resize={true}
                style={{ width: '75%' }}
                draggable={expand ? true : false}
              />
            </div>
            <div
              className={`nyris__success-multiple-preview-delete-${
                expand ? 'expand' : 'collapse'
              }`}
              onClick={onRestart}
            >
              <Trash />
            </div>
            <input
              type="file"
              name="take-picture"
              id="nyris__hello-open-camera"
              accept="image/jpeg,image/png,image/webp"
              onChange={(f: any) => {
                setPostFilter({});
                onFile(f, selectedPreFiltersLabel);
              }}
              style={{ display: 'none' }}
            />
            <div
              className={`nyris__success-multiple-preview-${
                expand ? 'expand' : 'collapse'
              }`}
              onClick={() => {
                setExpand(s => !s);
              }}
            >
              {!expand && <img src={crop} width={16} height={16} />}
              {expand && <img src={collapse} width={16} height={16} />}
            </div>
          </div>

          {image !== firstSearchImage && !loading && (
            <div
              className="go-back-button"
              onClick={() => {
                setPostFilter({});
                onGoBack();
              }}
            >
              <GoBack width={16} height={16} />
              {labels['Back to request image']}
            </div>
          )}

          {selectedFilters.length > 0 && (
            <div
              style={{
                padding: '0px 8px 16px 8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignSelf: 'stretch',
              }}
            >
              {selectedFilters.map(filter => {
                return (
                  <div
                    key={filter.value}
                    className="nyris__postFilter-selected-filter"
                    onClick={() => {
                      setPostFilter(
                        onFilterCheck(
                          {
                            [filter.key]: filter.value,
                          },
                          postFilter,
                        ),
                      );
                    }}
                  >
                    <div>
                      {filter.value} ({filter.count})
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        width: '20px',
                        height: '20px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Close width={10} height={10} />
                    </div>
                  </div>
                );
              })}
              <div
                className="nyris__postFilter-clear"
                onClick={() => setPostFilter({})}
              >
                <div>{labels['Clear']}</div>
              </div>
            </div>
          )}

          {loading && (
            <LoadingSpinner description={labels['Analyzing image...']} />
          )}
          {!loading && (
            <>
              <div
                className="nyris__success-multiple-result-list"
                // style={{ paddingBottom: feedbackStatus === 'visible' ? 300 : 280 }}
              >
                {filteredProducts.map((r, i) => (
                  <ProductCard
                    {...r}
                    key={i}
                    onSimilarSearch={(f: any) => {
                      onSimilarSearch(f, selectedPreFiltersLabel).then(() => {
                        setPostFilter({});
                      });
                    }}
                    cadenasScriptStatus={cadenasScriptStatus}
                  />
                ))}
                <div className="nyris__inquiry-container">
                  <img
                    src={image.toDataURL('image/png')}
                    alt="searched image"
                    className="nyris__inquiry-container-image"
                  />
                  <div className="nyris__inquiry-container-banner">
                    <div className="nyris__inquiry-container-banner-header">
                      {labels['No results found for your query?']}
                    </div>
                    <div className="nyris__inquiry-container-banner-text">
                      {labels['Share it with the team']}
                    </div>
                    <button
                      className="nyris__inquiry-container-banner-button"
                      type="button"
                      onClick={() => setIsInquiryModalOpen(true)}
                    >
                      {labels['Inquiry']}
                      <Icon name="email" color="#fff" width={16} height={12} />
                    </button>
                  </div>
                </div>
              </div>
              {/* invisible element to compensate space taken by list of prefilters */}
              <div
                style={{
                  paddingRight: '4px',
                  paddingLeft: '2px',
                  fontWeight: 'bold',
                  opacity: 0,
                }}
              >
                {selectedPreFiltersLabel?.join(', ')}
              </div>
              {showFeedbackSuccess && (
                <div className="nyris__feedback-section">
                  <div className="nyris__feedback-success">
                    {labels['Thanks for your feedback!']}
                  </div>
                </div>
              )}
              {isInquiryModalOpen && (
                <Inquiry
                  imageSource={image}
                  isPopupOpened={isInquiryModalOpen}
                  labels={labels}
                  onClose={() => setIsInquiryModalOpen(false)}
                  prefilters={Object.keys(selectedPreFilters)}
                />
              )}
              {feedbackStatus === 'visible' && !showFeedbackSuccess && (
                <div className="nyris__feedback-section">
                  <Feedback
                    labels={labels}
                    submitFeedback={handleSubmitFeedback}
                    onFeedbackClose={() => {
                      setFeedbackStatus('submitted');
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="nyris__action-section">
          <div className="nyris__action-wrapper">
            <div className="nyris__action-wrapper-button mobile">
              <Camera
                className="nyris__action-wrapper-button-camera"
                onClick={() => setIsCameraOpen(true)}
              />
            </div>
            <label
              className="nyris__action-wrapper-button desktop"
              htmlFor="nyris__hello-open-camera"
            >
              <Camera className="nyris__action-wrapper-button-camera" />
            </label>
          </div>
          {window.nyrisSettings.filter &&
            window.nyrisSettings.filter?.length > 0 &&
            !noResult && (
              <div
                className="nyris__action-wrapper"
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                <div
                  className={`nyris__action-wrapper-button ${
                    !!selectedFilters.length ? 'active' : ''
                  }`}
                >
                  <Filter
                    fill={!!selectedFilters.length ? '#FFF' : '#55566B'}
                  />
                  {!!selectedFilters.length ? (
                    <div className="nyris__action-wrapper-button-indicator" />
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PostFilter
            onClose={() => setIsModalOpen(false)}
            postFilter={postFilter}
            // allFilter={allFilter}
            setPostFilter={setPostFilter}
            results={results}
            labels={labels}
          />
        </Modal>
        <Modal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          className="web-camera"
        >
          <WebCameraModal
            handlerFindImage={(f: any) => {
              setIsCameraOpen(false);
              onFile(f, Object.keys(selectedPreFilters));
            }}
            onClose={() => setIsCameraOpen(false)}
          />
        </Modal>
      </div>
    </>
  );
};
