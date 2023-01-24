import { Box, Button, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import IconSearch from 'common/assets/icons/icon_search.svg';
import { getFilters, searchFilters } from 'services/filter';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { setUpdateKeyFilterDesktop } from 'Store/Search';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useMediaQuery } from 'react-responsive';
interface Props {
  handleClose?: any;
  // onChangeKeyFilter?: any;
}

function FilterComponent(props: Props) {
  const { handleClose } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { settings, search } = stateGlobal;
  const [resultFilter, setResultFilter] = useState<any>([]);
  const [itemChoose, setItemChoose] = useState<string>('');
  const [keyFilter, setKeyFilter] = useState<string | null>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(0);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  useEffect(() => {
    setLoading(true);
    getDataFilterDesktop();
  }, []);

  const getDataFilterDesktop = async () => {
    const dataResultFilter = getFilters(1000, settings)
      .then(res => {
        const arrResult =
          res.find(value => value.key === settings.filterType)?.values || [];
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
      });
    setTimeout(() => {
      setLoading(false);
    }, 500);
    return dataResultFilter;
  };

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    value: any,
  ) => {
    setItemChoose(value);
    setKeyFilter(value);
  };

  const filterSearchHandler = async (value: any) => {
    if (!value) {
      getDataFilterDesktop();
      return;
    }
    const data = await searchFilters(settings.filterType, value, settings)
      .then(res => {
        // console.log("res", res);
        const newResult = res.sort().reduce((a: any, c: any) => {
          let k = c[0].toLocaleUpperCase();
          if (a[k]) a[k].push(c);
          else a[k] = [c];
          return a;
        }, {});
        setResultFilter(newResult);
        setColumns(Object.keys(newResult).length);
        return;
      })
      .catch((e: any) => {
        console.log('err filterSearchHandler', e);
      });
    return data;
  };

  const onHandlerSubmitData = () => {
    dispatch(setUpdateKeyFilterDesktop(itemChoose));
    handleClose();
  };

  return (
    <Box
      className="box-child-component-filter-desktop"
      display={'flex'}
      flexDirection={'column'}
      style={{ position: 'relative' }}
    >
      {isMobile && (
        <Typography
          style={{ color: '#000', fontSize: '35px', fontWeight: 700 }}
        >
          Select a model
        </Typography>
      )}
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
              <Typography className="keyFilter">{keyFilter}</Typography>
              <Button style={{ padding: 0 }} onClick={() => setKeyFilter('')}>
                <CloseIcon style={{ fontSize: 12, color: '#2B2C46' }} />
              </Button>
            </Box>
          )}

          <input
            className="input-search-filter"
            placeholder="Search a machine"
            style={{ minWidth: isMobile ? 'auto' : 512 }}
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
            ? { columnCount: 1, marginBottom: itemChoose ? '50px' : '0px' }
            : columns <= 4
            ? { columnCount: columns, height: '100%' }
            : { columnCount: 4 }
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
                value={itemChoose}
                exclusive
                onChange={handleAlignment}
                aria-label=""
                className="box-btn-group"
              >
                {value.map((item: any, index: any) => {
                  return (
                    <ToggleButton
                      value={item}
                      aria-label={item}
                      className="item-btn"
                      onChange={() => {
                        setItemChoose(item);
                        setKeyFilter(item);
                      }}
                    >
                      {item}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Box>
          );
        })}

        {!resultFilter && !isLoading && <Typography>No result</Typography>}
      </Box>
      {itemChoose && !isMobile && (
        <Box
          className="footer"
          style={{ height: 64, marginTop: 'auto' }}
          display={'flex'}
        >
          <Button
            className="button-left"
            style={{
              width: '50%',
              backgroundColor: '#1E1F31',
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
              backgroundColor: '#3E36DC',
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
      {itemChoose && isMobile && (
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
              backgroundColor: '#1E1F31',
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
              backgroundColor: '#3E36DC',
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

export default FilterComponent;
