import React, { useEffect, useMemo, useState } from 'react';
import { getFilters, searchFilters } from 'services/filter';

import { isEmpty, pickBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Icon } from '@nyris/nyris-react-components';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import { truncateString } from 'utils/truncateString';
import { twMerge } from 'tailwind-merge';
import Tooltip from 'components/Tooltip/TooltipComponent';
import { Skeleton } from 'components/Skeleton';
import { useNavigate } from 'react-router';

interface Props {
  handleClose?: any;
  // onChangeKeyFilter?: any;
}
const maxFilter = 10;
const PreFilterComponent = (props: Props) => {
  const { handleClose } = props;
  const { settings } = window;
  const [resultFilter, setResultFilter] = useState<any>([]);

  const [searchKey, setSearchKey] = useState<string>('');

  const [isLoading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(0);

  const { singleImageSearch } = useImageSearch();

  const requestImages = useRequestStore(state => state.requestImages);
  const imageRegions = useRequestStore(state => state.regions);
  const keyFilterState = useRequestStore(state => state.preFilter);

  const setPreFilter = useRequestStore(state => state.setPreFilter);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const specification = useRequestStore(state => state.specifications);
  const setSpecifications = useRequestStore(state => state.setSpecifications);

  const [keyFilter, setKeyFilter] = useState<Record<string, boolean>>(
    keyFilterState || {},
  );
  const navigate = useNavigate();

  const selectedFilter = useMemo(
    () =>
      Object.keys(keyFilter).reduce((count, key) => {
        if (keyFilter[key] === true) {
          return count + 1;
        }
        return count;
      }, 0),
    [keyFilter],
  );

  useEffect(() => {
    getDataFilterDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDataFilterDesktop = async () => {
    setLoading(true);
    const dataResultFilter = getFilters(1000, settings)
      .then(res => {
        const arrResult =
          res.find(value => value.key === settings.visualSearchFilterKey)
            ?.values || [];

        const newResult = arrResult.sort().reduce((a: any, c: any) => {
          if (!c[0]) return a;
          let k = c[0]?.toLocaleUpperCase();
          if (a[k]) a[k].push(c);
          else a[k] = [c];
          return a;
        }, {});
        setResultFilter(newResult);
        setColumns(Object.keys(newResult).length);
        
      })
      .catch((e: any) => {
        console.log('err getDataFilterDesktop', e);
      })
      .finally(() => {
        setLoading(false);
      });

    return dataResultFilter;
  };

  const filterSearchHandler = async (value: any) => {
    if (!value) {
      getDataFilterDesktop();
      return;
    }
    const data = await searchFilters(
      settings.visualSearchFilterKey,
      encodeURIComponent(value),
      settings,
    )
      .then(res => {
        if (res.length > 0) {
          setResultFilter({ [res[0][0].toLocaleUpperCase()]: res });
          if (res.length <= 20) setColumns(1);
          else if (res.length <= 40) setColumns(2);
          else setColumns(4);
        } else {
          setResultFilter({});
          setColumns(4);
        }
        return;
      })
      .catch((e: any) => {
        console.log('err filterSearchHandler', e);
      });
    return data;
  };

  const onHandlerSubmitData = () => {
    const preFilter = pickBy(keyFilter, value => !!value);
    setPreFilter(preFilter);

    const preFilterValues = Object.keys(preFilter) as string[];
    const filter =
      preFilterValues.length > 0
        ? preFilterValues
            .map(item => `${settings.alogoliaFilterField}:'${item}'`)
            .join(' OR ')
        : '';
    setAlgoliaFilter(filter);

    if (preFilterValues?.length && preFilterValues[0] !== specification?.prefilter_value) {
      console.log('here');
      setSpecifications({ prefilter_value: preFilterValues?.join(', ') || ''});
    }

    handleClose();

    if (requestImages.length === 0) {
      return;
    }

    if (requestImages.length === 1) {
      singleImageSearch({
        image: requestImages[0],
        settings,
        imageRegion: imageRegions[0],
        preFilterParams: preFilter,
        compress: false,
      }).then(res => {});
    } else {
    }
  };
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col overflow-y-auto">
      <div className="bg-white w-full flex justify-between sticky top-0 z-100">
        <div className="text-black text-2xl font-bold pl-4 desktop:-mb-2 desktop:mt-6">
          {settings.preFilterTitle}
        </div>

        <div
          onClick={handleClose}
          className="w-8 h-8 flex justify-center items-center cursor-pointer mr-2"
        >
          <Icon name="close" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 mb-6 ml-4 mr-4">
        <div className="bg-[#f3f3f5] rounded-3xl h-10 w-full desktop:w-fit flex justify-items-center">
          <div className="ml-3 mr-3 flex justify-center items-center">
            <Icon name="search" width={18} height={18} className="max-w-fit" />
          </div>

          <input
            className="border-none  bg-transparent outline-none w-full desktop:w-[500px] h-full"
            placeholder={t('Search')}
            onChange={(e: any) => {
              filterSearchHandler(e.target.value);
              setSearchKey(e.target.value);
            }}
            value={searchKey}
          />
          {searchKey && (
            <div
              className="w-10 h-10 rounded-[50%] flex justify-center items-center cursor-pointer"
              onClick={() => {
                setSearchKey('');
                filterSearchHandler('');
              }}
            >
              <Icon name="close" className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </div>

      {!isEmpty(keyFilter) && selectedFilter > 0 && (
        <div className="py-2.5 flex justify-between bg-[#FAFAFA] ml-4 mb-1 desktop:mb-0">
          <div className="flex flex-wrap gap-2 items-baseline text-xs mb-1">
            {Object.keys(keyFilter).map((key, index) => {
              if (!keyFilter[key])
                return <React.Fragment key={index}></React.Fragment>;
              return (
                <div
                  key={index}
                  className={twMerge([
                    'items-center',
                    'bg-[#e0e0e0]',
                    'rounded-[21px]',
                    'h-full',
                    'p-1',
                    'px-2',
                    'flex',
                    'h-fit',
                    'gap-2',
                  ])}
                >
                  <div className="keyFilter">{key}</div>
                  <div
                    className="p-0 cursor-pointer"
                    onClick={() => setKeyFilter({ ...keyFilter, [key]: false })}
                  >
                    <Icon name="close" className="w-3 h-3 text-gray-800" />
                  </div>
                </div>
              );
            })}
            <p className="font-bold text-black">{`${selectedFilter}/${maxFilter}`}</p>
            <div
              className="text-red-600 text-xs cursor-pointer ml-3"
              onClick={() => {
                setKeyFilter({});
              }}
            >
              {t('Clear all')}
            </div>
          </div>
        </div>
      )}
      <div
        className={twMerge([
          'gap-x-5',
          'flex-wrap',
          'max-w-full',
          'overflow-y-auto',
          'px-6',
          'w-full',
          `${
            'h-full mb-0 desktop:columns-' +
            (columns <= 4 ? columns : 4) +
            ' desktop:h-full desktop:p-6 desktop:bg-[#FAFAFA]'
          }`,
          'pb-8 desktop:pb-0',
        ])}
      >
        {Object.entries(resultFilter)
          .sort()
          .map(([key, value]: any, i: any) => {
            return (
              <div className="mt-5" key={i}>
                <div className="flex flex-col gap-3 w-full">
                  <div className="font-bold text-black text-xs">{key}</div>

                  {value.map((item: any, index: any) => {
                    return (
                      <Tooltip
                        key={item}
                        content={item}
                        disabled={item.length < 35}
                      >
                        <div
                          key={index + '-' + index}
                          aria-label={item}
                          className={`cursor-pointer text-xs min-h-5 w-full max-w-fit overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${
                            keyFilter[item] ? 'bg-[#e9e9ec]' : ''
                          } rounded-lg px-2`}
                          onClick={() => {
                            if (selectedFilter < maxFilter) {
                              setKeyFilter({
                                ...keyFilter,
                                [item]: !keyFilter[item],
                              });
                            }
                          }}
                        >
                          {truncateString(item, 35)}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {isLoading && (
          <div className={`columns-1 desktop:columns-4`}>
            {Array(12)
              .fill('')
              .map((_, index) => {
                return (
                  <div key={index} className="mb-4 flex flex-col gap-3 w-full">
                    <Skeleton className="h-[20px] w-[60px]" />
                    {Array(6)
                      .fill('')
                      .map((_, index) => (
                        <Skeleton key={index} className="h-[20px] w-full" />
                      ))}
                  </div>
                );
              })}
          </div>
        )}
        {isEmpty(resultFilter) && !isLoading && (
          <div>{t('No result found')}</div>
        )}
      </div>
      <div className="footer h-16 mt-auto flex">
        <div
          style={{
            backgroundColor: settings.theme.secondaryColor,
          }}
          className="button-left w-1/2  text-white rounded-none justify-start text-none pl-4 pt-4 pb-8 cursor-pointer"
          onClick={() => handleClose()}
        >
          {t('Cancel')}
        </div>
        <div
          style={{
            backgroundColor: settings.theme.primaryColor,
          }}
          className="button-right w-1/2  text-white rounded-none justify-start text-none pl-4 pt-4 pb-8 cursor-pointer"
          onClick={() => onHandlerSubmitData()}
        >
          {t('Apply')}
        </div>
      </div>
    </div>
  );
};
export default PreFilterComponent;
