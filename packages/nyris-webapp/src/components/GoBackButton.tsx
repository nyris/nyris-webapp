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
import { useAppDispatch, useAppSelector } from '../Store/Store';
import useRequestStore from 'Store/requestStore';
import { Icon } from '@nyris/nyris-react-components';

const GoBackButton = ({ items, refine }: CurrentRefinementsProvided) => {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const { firstSearchResults, firstSearchImage, firstSearchPrefilters } =
    search;
  const clearPostFilters = useCallback(() => refine(items), [refine, items]);
  const { t } = useTranslation();

  const { setRequestImages, resetRegions } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
    resetRegions: state.resetRegions,
  }));
  const onGoBack = () => {
    dispatch(setSearchResults(firstSearchResults));
    dispatch(setRequestImage(firstSearchImage));
    setRequestImages([firstSearchImage]);
    dispatch(setPreFilter(firstSearchPrefilters));
    dispatch(clearPostFilter());
    resetRegions();
    clearPostFilters();
  };

  return (
    <div
      className={`go-back-button ${isMobile ? 'mobile-view' : ''}`}
      onClick={() => onGoBack()}
    >
      <Icon name="back" />
      {t('Back to request image')}
    </div>
  );
};

export const GoBack = connectCurrentRefinements<any>(GoBackButton);
