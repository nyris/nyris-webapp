import React, {useCallback} from 'react';
import { useMediaQuery } from 'react-responsive';
import { CurrentRefinementsProvided } from 'react-instantsearch-core';
import {
  setFirstCountOfSearches,
  setImageSearchInput,
  setPreFilter,
  setRequestImage,
  setSearchResults,
  clearPostFilter
} from '../Store/search/Search';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { ReactComponent as GoBackIcon } from 'common/assets/icons/path.svg';
import { useAppDispatch, useAppSelector } from '../Store/Store';

const GoBackButton = ({ items, refine }: CurrentRefinementsProvided) => {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const {
    firstSearchResults,
    firstSearchImage,
    firstSearchPrefilters,
    countOfSearch,
    firstSearchThumbSearchInput,
  } = search;
  const clearPostFilters = useCallback(() => refine(items), [refine, items]);
  const onGoBack = () => {
    dispatch(setSearchResults(firstSearchResults));
    dispatch(setRequestImage(firstSearchImage));
    dispatch(setPreFilter(firstSearchPrefilters));
    dispatch(setFirstCountOfSearches(1));
    dispatch(clearPostFilter());
    clearPostFilters();
    if (!isMobile) {
      dispatch(setImageSearchInput(firstSearchThumbSearchInput));
    }
  }

  return (
    <div
      className={`go-back-button ${isMobile ? 'mobile-view' : ''}`}
      onClick={() => onGoBack()}
    >
      <GoBackIcon width={16} height={16}  />
      {countOfSearch === 2 ? 'Back' : 'Return to first image'}
    </div>
  )
};

export const GoBack = connectCurrentRefinements<any>(
  GoBackButton,
);
