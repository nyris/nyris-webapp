import NyrisAPI, { NyrisAPISettings } from '@nyris/nyris-api';
import { getNyrisSettings } from 'utils/nyrisApiKey';

export interface Filter {
  key?: string;
  values: string[];
}

export const getFilters = async (
  number: number = 10,
  settings: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(getNyrisSettings(settings));
  return nyrisApi.getFilters(number);
};

export const searchFilters = async (
  key: any = '',
  value: string,
  settingsNyris: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(getNyrisSettings(settingsNyris));
  const newValue = value ? value : '';
  return nyrisApi.searchFilters(key, newValue);
};

export interface ScopeResponse {
  itemKeys: string[];
  filterAttributes: Filter[];
}

export const getScopes = async (
  scopeIds: string,
  settings: NyrisAPISettings,
): Promise<ScopeResponse> => {
  const nyrisApi = new NyrisAPI(settings);
  return nyrisApi.getScopes(scopeIds);
};
