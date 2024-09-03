import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { CurrentRefinementsProvided } from 'react-instantsearch-core';
import {
  setPreFilter,
  setRequestImage,
  setSearchResults,
  clearPostFilter,
} from '../Store/search/Search';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { ReactComponent as GoBackIcon } from 'common/assets/icons/path.svg';
import { useAppDispatch, useAppSelector } from '../Store/Store';
import useRequestStore from 'Store/requestStore';

const GoBackButton = ({ items, refine }: CurrentRefinementsProvided) => {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const { firstSearchResults, firstSearchImage, firstSearchPrefilters } =
    search;
  const clearPostFilters = useCallback(() => refine(items), [refine, items]);
  const { t } = useTranslation();
  const { setRequestImages } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
  }));
  const onGoBack = () => {
    dispatch(setSearchResults(firstSearchResults));
    dispatch(setRequestImage(firstSearchImage));
    setRequestImages([firstSearchImage]);
    dispatch(setPreFilter(firstSearchPrefilters));
    dispatch(clearPostFilter());
    clearPostFilters();
  };

  return (
    <div
      className={`go-back-button ${isMobile ? 'mobile-view' : ''}`}
      onClick={() => onGoBack()}
    >
      <GoBackIcon width={16} height={16} />
      {t('Back to request image')}
    </div>
  );
};

export const GoBack = connectCurrentRefinements<any>(GoBackButton);
