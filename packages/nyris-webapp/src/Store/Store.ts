import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers } from 'redux';
import { AppSettings } from 'types';
import { getUrlParam } from 'utils';
import Search from 'Store/search/Search';
import { defaultSettings } from './constants';

declare var settings: AppSettings;

settings.algolia.enabled = true;
settings.showFeedbackAndShare = false;
settings.multiImageSearch = false;
settings.preview = true;
settings.clarityId = '';

if (settings.cadSearch) {
  settings.preview = false;
  settings.support.enabled = false;
}

if (settings.rfq?.enabled && settings.support?.enabled) {
  settings.support.enabled = false;
}

let normalizedSettings: AppSettings = {
  ...defaultSettings,
  ...settings,
};

normalizedSettings = {
  ...normalizedSettings,
  apiKey: (getUrlParam('apiKey') as string) || normalizedSettings.apiKey,
  xOptions: (getUrlParam('xOptions') as string) || normalizedSettings.xOptions,
  regions:
    (getUrlParam('use.regions') as boolean) || normalizedSettings.regions,
  preview:
    (getUrlParam('use.preview') as boolean) || normalizedSettings.preview,
};

const reducers = combineReducers({
  settings: () => normalizedSettings,
  search: Search,
});

export const store = configureStore({
  reducer: reducers,
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
