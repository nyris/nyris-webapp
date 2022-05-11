import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers } from "redux";
import Auth from "Store/Auth";
import { AppSettings } from "types";
import { defaultSettings } from "defaults";
import { getUrlParam } from "utils";
import Search from "Store/Search";
import Nyris from "Store/Nyris";

declare var settings: AppSettings;

let normalizedSettings: AppSettings = {
  ...defaultSettings,
  ...settings,
};

normalizedSettings = {
  ...normalizedSettings,
  apiKey: (getUrlParam("apiKey") as string) || normalizedSettings.apiKey,
  xOptions: (getUrlParam("xOptions") as string) || normalizedSettings.xOptions,
  regions:
    (getUrlParam("use.regions") as boolean) || normalizedSettings.regions,
  preview:
    (getUrlParam("use.preview") as boolean) || normalizedSettings.preview,
};

const reducers = combineReducers({
  auth: Auth,
  settings: () => normalizedSettings as AppSettings,
  search: Search,
  nyris: Nyris,
});

export const store = configureStore({
  reducer: reducers,
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
