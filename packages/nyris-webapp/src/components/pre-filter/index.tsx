import { Button, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { getFilters, searchFilters } from 'services/filter';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import {
  loadingActionResults,
  setPreFilter,
  setSearchResults,
  updateStatusLoading,
} from 'Store/search/Search';
import { useMediaQuery } from 'react-responsive';
import { isEmpty, pickBy } from 'lodash';
import { Skeleton } from '@material-ui/lab';
import { truncateString } from 'helpers/truncateString';
import { find } from 'services/image';
import { useQuery } from 'hooks/useQuery';
import { useTranslation } from 'react-i18next';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import { Icon } from '@nyris/nyris-react-components';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'Store/requestStore';

interface Props {
  handleClose?: any;
  // onChangeKeyFilter?: any;
}
const maxFilter = 10;
function PreFilterComponent(props: Props) {
  const { handleClose } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const [resultFilter, setResultFilter] = useState<any>([]);
  const query = useQuery();
  const searchQuery = query.get('query') || '';
  const { search } = stateGlobal;
  const { preFilter: keyFilterState, requestImage, selectedRegion } = search;

  const [keyFilter, setKeyFilter] = useState<Record<string, boolean>>(
    keyFilterState || {},
  );
  const [searchKey, setSearchKey] = useState<string>('');

  const [isLoading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  const { singleImageSearch, multiImageSearch } = useImageSearch();

  const { imageRegions, requestImages } = useRequestStore(state => ({
    requestImages: state.requestImages,
    updateRegion: state.updateRegion,
    resetRegions: state.resetRegions,
    imageRegions: state.regions,
  }));

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

  // useEffect(() => {
  //   filterSearchHandler(searchKey);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchKey]);

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
    dispatch(setPreFilter(preFilter));
    handleClose();

    if (!settings.algolia?.enabled && (searchQuery || requestImage)) {
      let payload: any;
      let filters: any[] = [];
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter),
        },
      ];
      dispatch(updateStatusLoading(true));
      find({
        image: requestImage?.canvas as HTMLCanvasElement,
        settings,
        filters: !isEmpty(preFilter) ? preFilterValues : undefined,
        region: selectedRegion,
        text: searchQuery,
      })
        .then((res: any) => {
          res?.results.forEach((item: any) => {
            filters.push({
              sku: item.sku,
              score: item.score,
            });
          });
          payload = {
            ...res,
            filters,
          };
          dispatch(setSearchResults(payload));
          dispatch(updateStatusLoading(false));
        })
        .catch((e: any) => {
          dispatch(updateStatusLoading(false));
        });
    } else {
      if (requestImages.length === 0) {
        return;
      }
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());

      if (requestImages.length === 1) {
        singleImageSearch({
          image: requestImages[0],
          settings,
          imageRegion: imageRegions[0],
          preFilterParams: preFilter,
          compress: false,
        }).then(res => {
          dispatch(updateStatusLoading(false));
        });
      } else {
        multiImageSearch({
          images: requestImages,
          settings,
          regions: imageRegions,
          preFilterParams: preFilter,
        }).then(res => {
          dispatch(updateStatusLoading(false));
        });
      }
    }
  };
  const { t } = useTranslation();

  return (
    <div
      className="box-child-component-filter-desktop"
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography
          style={{
            color: '#000',
            fontSize: '24px',
            fontWeight: 700,
            paddingLeft: '14px',
            marginBottom: isMobile ? '0px' : '-8px',
            marginTop: isMobile ? '0px' : '24px',
          }}
        >
          {settings.preFilterTitle}
        </Typography>

        <Button onClick={handleClose}>
          <CloseIcon />
        </Button>
      </div>
      <div
        className="box-top"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className="box-input-search-filter"
          style={{
            width: isMobile ? '100%' : '',
            display: 'flex',
            justifyItems: 'center',
          }}
        >
          <div
            className="icon-search"
            style={{
              marginRight: 11,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name="search"
              width={18}
              height={18}
              style={{ maxWidth: 'fit-content' }}
            />
          </div>

          <input
            className="input-search-filter"
            placeholder={t('Search')}
            onChange={(e: any) => {
              filterSearchHandler(e.target.value);
              setSearchKey(e.target.value);
            }}
            value={searchKey}
          />
          <Button
            className="btn-clear-text"
            onClick={() => {
              setSearchKey('');
              filterSearchHandler('');
            }}
          >
            <ClearOutlinedIcon style={{ fontSize: 16, color: '#2B2C46' }} />
          </Button>
        </div>
      </div>

      {!isEmpty(keyFilter) && selectedFilter > 0 && (
        <div
          style={{
            padding: '10px 16px 10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              rowGap: '8px',
              columnGap: '8px',
              alignItems: 'baseline',
              fontSize: '12px',
              marginBottom: '4px',
            }}
          >
            {Object.keys(keyFilter).map((key, index) => {
              if (!keyFilter[key]) return <></>;
              return (
                <div
                  key={index}
                  className="box-keyFilter"
                  style={{ display: 'flex', height: 'fit-content', gap: '8px' }}
                >
                  <Typography className="keyFilter">{key}</Typography>
                  <Button
                    style={{ padding: 0 }}
                    onClick={() => setKeyFilter({ ...keyFilter, [key]: false })}
                  >
                    <CloseIcon style={{ fontSize: 12, color: '#2B2C46' }} />
                  </Button>
                </div>
              );
            })}
            <p
              style={{ fontWeight: 'bold', color: '#000' }}
            >{`${selectedFilter}/${maxFilter}`}</p>
            <div
              style={{
                color: '#E31B5D',
                fontSize: '12px',
                cursor: 'pointer',
                marginLeft: '12px',
              }}
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
        className="box-bottom"
        style={
          isMobile
            ? {
                columnCount: 1,
                height: '100%',
                marginBottom: keyFilter ? '50px' : '0px',
              }
            : columns <= 4
            ? {
                columnCount: columns,
                height: '100%',
                padding: '24px 24px 40px 24px',
                backgroundColor: '#FAFAFA',
              }
            : {
                columnCount: 4,
                padding: '24px 24px 40px 24px',
                height: '100%',
                backgroundColor: '#FAFAFA',
              }
        }
      >
        {Object.entries(resultFilter)
          .sort()
          .map(([key, value]: any, i: any) => {
            return (
              <div className="box-group-items" key={key}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '12px',
                    width: '100%',
                  }}
                >
                  <Typography
                    style={{
                      fontWeight: 'bold',
                      color: '#000',
                      fontSize: '12px',
                    }}
                  >
                    {key}
                  </Typography>

                  {value.map((item: any, index: any) => {
                    return (
                      <Tooltip
                        key={item}
                        title={item}
                        placement="top"
                        arrow={true}
                        disableHoverListener={item.length < 35}
                      >
                        <div
                          aria-label={item}
                          style={{
                            cursor: 'pointer',
                            fontSize: '12px',
                            minHeight: '20px',
                            color: '#2B2C46',
                            width: '100%',
                            maxWidth: 'fit-content',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            backgroundColor: keyFilter[item] ? '#E9E9EC' : '',
                            borderRadius: 8,
                            paddingLeft: '8px',
                            paddingRight: '8px',
                          }}
                          onClick={() => {
                            if (selectedFilter < maxFilter) {
                              setKeyFilter({
                                ...keyFilter,
                                [item]: !keyFilter[item],
                              });
                            }
                          }}
                        >
                          {truncateString(item, !isMobile ? 35 : 35)}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        {isLoading && (
          <div style={{ columnCount: isMobile ? 1 : 4 }}>
            {Array(12)
              .fill('')
              .map((_, index) => {
                return (
                  <div key={index} style={{ marginBottom: 5 }}>
                    <Skeleton animation={'pulse'} height={30} width={60} />
                    {Array(6)
                      .fill('')
                      .map((_, index) => (
                        <Skeleton key={index} animation={'pulse'} height={30} />
                      ))}
                  </div>
                );
              })}
          </div>
        )}
        {isEmpty(resultFilter) && !isLoading && (
          <Typography>{t('No result found')}</Typography>
        )}
      </div>
      {!isMobile && (
        <div
          className="footer"
          style={{ height: 64, marginTop: 'auto', display: 'flex' }}
        >
          <Button
            className="button-left"
            style={{
              width: '50%',
              backgroundColor: settings.theme.secondaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
              textTransform: 'none',
              paddingLeft: '16px',
              paddingTop: '16px',
              paddingBottom: '32px',
            }}
            onClick={() => handleClose()}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="button-right"
            style={{
              width: '50%',
              backgroundColor: settings.theme?.primaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
              textTransform: 'none',
              paddingLeft: '16px',
              paddingTop: '16px',
              paddingBottom: '32px',
            }}
            onClick={() => onHandlerSubmitData()}
          >
            {t('Apply')}
          </Button>
        </div>
      )}
      {isMobile && (
        <div
          className="footer"
          style={{
            height: 64,
            marginTop: 'auto',
            position: 'fixed',
            bottom: '0px',
            left: '0px',
            width: '100vw',
            display: 'flex',
          }}
        >
          <Button
            className="button-left"
            style={{
              width: '50%',
              backgroundColor: settings.theme.secondaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
              textTransform: 'none',
            }}
            onClick={() => handleClose()}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="button-right"
            style={{
              width: '50%',
              backgroundColor: settings.theme?.primaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
              textTransform: 'none',
            }}
            onClick={() => onHandlerSubmitData()}
          >
            {t('Apply')}
          </Button>
        </div>
      )}
    </div>
  );
}
export default PreFilterComponent;
