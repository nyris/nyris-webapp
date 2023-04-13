import { Box, Button, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import IconSearch from 'common/assets/icons/icon_search.svg';
import { getFilters, searchFilters } from 'services/filter';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { setUpdateKeyFilterDesktop } from 'Store/search/Search';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useMediaQuery } from 'react-responsive';
import { isEmpty } from 'lodash';
import { Skeleton } from '@material-ui/lab';
import { truncateString } from 'helpers/truncateString';

interface Props {
  handleClose?: any;
  // onChangeKeyFilter?: any;
}

function PreFilterComponent(props: Props) {
  const { handleClose } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const {
    settings,
    search: { keyFilter: keyFilterState },
  } = stateGlobal;
  const [resultFilter, setResultFilter] = useState<any>([]);
  const [keyFilter, setKeyFilter] = useState<string>(keyFilterState || '');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  const getDataFilterDesktop = async () => {
    setLoading(true);
    const dataResultFilter = getFilters(1000, settings)
      .then(res => {
        const arrResult =
          res.find(value => value.key === settings.visualSearchFilterKey)
            ?.values || [];
        const newResult = arrResult.sort().reduce((a: any, c: any) => {
          let k = c[0].toLocaleUpperCase();
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

  useEffect(() => {
    getDataFilterDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    value: any,
  ) => {
    setKeyFilter(value);
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
        // console.log("res", res);
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
    dispatch(setUpdateKeyFilterDesktop(keyFilter));
    handleClose();
  };

  return (
    <Box
      className="box-child-component-filter-desktop"
      display={'flex'}
      flexDirection={'column'}
      style={{ position: 'relative' }}
    >
      <Typography
        style={{
          color: '#000',
          fontSize: '24px',
          fontWeight: 700,
          paddingLeft: isMobile ? '0px' : '14px',
          marginBottom: isMobile ? '0px' : '-8px',
          marginTop: isMobile ? '0px' : '24px',
        }}
      >
        {settings.preFilterTitle}
      </Typography>

      <Box
        className="box-top"
        style={isMobile ? { padding: 0 } : undefined}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Box
          className="box-input-search-filter"
          display={'flex'}
          justifyItems={'center'}
          style={isMobile ? { width: '100%' } : undefined}
        >
          {(!keyFilter || isMobile) && (
            <Box
              className="icon-search"
              style={{ marginRight: 11 }}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <img
                style={{ maxWidth: 'fit-content' }}
                src={IconSearch}
                alt=""
                width={18}
                height={18}
              />
            </Box>
          )}

          {keyFilter && !isMobile && (
            <Box display={'flex'} className="box-keyFilter">
              <Typography className="keyFilter max-line-1">
                {keyFilter}
              </Typography>
              <Button style={{ padding: 0 }} onClick={() => setKeyFilter('')}>
                <CloseIcon style={{ fontSize: 12, color: '#2B2C46' }} />
              </Button>
            </Box>
          )}

          <input
            className="input-search-filter"
            placeholder="Search"
            onChange={(e: any) => {
              filterSearchHandler(e.target.value);
            }}
          />
        </Box>

        {!isMobile && (
          <Button onClick={handleClose}>
            <CloseIcon />
          </Button>
        )}
      </Box>

      <Box style={{ margin: '10px 16px' }}>
        {keyFilter && isMobile && (
          <Box
            display={'flex'}
            className="box-keyFilter"
            style={{ display: 'inline-flex' }}
          >
            <Typography className="keyFilter">{keyFilter}</Typography>
            <Button style={{ padding: 0 }} onClick={() => setKeyFilter('')}>
              <CloseIcon style={{ fontSize: 12, color: '#2B2C46' }} />
            </Button>
          </Box>
        )}
      </Box>
      <Box
        className="box-bottom"
        height={'100%'}
        style={
          isMobile
            ? { columnCount: 1, marginBottom: keyFilter ? '50px' : '0px' }
            : columns <= 4
            ? { columnCount: columns, height: '100%', paddingBottom: 20 }
            : { columnCount: 4, paddingBottom: 20 }
        }
      >
        {Object.entries(resultFilter).map(([key, value]: any, i: any) => {
          return (
            <Box
              className="box-group-items"
              style={
                columns <= 4 ? { width: 'fit-content' } : { width: '100%' }
              }
            >
              <Typography
                style={{ fontWeight: 'bold', color: '#000', paddingLeft: 11 }}
              >
                {key}
              </Typography>

              <ToggleButtonGroup
                value={keyFilter}
                exclusive
                onChange={handleAlignment}
                aria-label=""
                className="box-btn-group"
              >
                {value.map((item: any, index: any) => {
                  return (
                    <Tooltip
                      key={item}
                      title={item}
                      placement="top"
                      arrow={true}
                      disableHoverListener={item.length < 20}
                    >
                      <ToggleButton
                        value={item}
                        aria-label={item}
                        className="item-btn"
                        onChange={() => {
                          setKeyFilter(item);
                        }}
                      >
                        {truncateString(item, !isMobile ? 20 : 35)}
                      </ToggleButton>
                    </Tooltip>
                  );
                })}
              </ToggleButtonGroup>
            </Box>
          );
        })}
        {isLoading && (
          <Box style={{ columnCount: isMobile ? 1 : 4 }}>
            {Array(12)
              .fill('')
              .map((_, index) => {
                return (
                  <Box key={index} mb={5}>
                    <Skeleton animation={'pulse'} height={30} width={60} />
                    {Array(6)
                      .fill('')
                      .map((_, index) => (
                        <Skeleton animation={'pulse'} height={30} />
                      ))}
                  </Box>
                );
              })}
          </Box>
        )}
        {isEmpty(resultFilter) && !isLoading && (
          <Typography>No result found</Typography>
        )}
      </Box>
      {keyFilter && !isMobile && (
        <Box
          className="footer"
          style={{ height: 64, marginTop: 'auto' }}
          display={'flex'}
        >
          <Button
            className="button-left"
            style={{
              width: '50%',
              backgroundColor: '#000000',
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
            }}
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          <Button
            className="button-right"
            style={{
              width: '50%',
              backgroundColor: settings.theme?.primaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
            }}
            onClick={() => onHandlerSubmitData()}
          >
            Apply
          </Button>
        </Box>
      )}
      {keyFilter && isMobile && (
        <Box
          className="footer"
          style={{
            height: 64,
            marginTop: 'auto',
            position: 'fixed',
            bottom: '0px',
            left: '0px',
            width: '100vw',
          }}
          display={'flex'}
        >
          <Button
            className="button-left"
            style={{
              width: '50%',
              backgroundColor: '#000000',
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
            }}
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          <Button
            className="button-right"
            style={{
              width: '50%',
              backgroundColor: settings.theme?.primaryColor,
              color: '#fff',
              borderRadius: 0,
              justifyContent: 'flex-start',
            }}
            onClick={() => onHandlerSubmitData()}
          >
            Apply
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default PreFilterComponent;
