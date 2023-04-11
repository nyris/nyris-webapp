import NyrisAPI, { NyrisAPISettings } from '@nyris/nyris-api';

export interface Filter {
  key?: string;
  values: string[];
}

export const getFilters = async (
  number: number = 10,
  settings: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(settings);
  return nyrisApi.getFilters(number);
};

export const searchFilters = async (
  key: any = '',
  value: string,
  settingsNyris: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(settingsNyris);
  const newValue = value ? value : '';
  return nyrisApi.searchFilters(key, newValue);
};
