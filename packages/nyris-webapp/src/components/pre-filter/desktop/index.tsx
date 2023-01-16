import { Box, Button, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import IconSearch from 'common/assets/icons/icon_search.svg';
import { getFilters, searchFilters } from 'services/filter';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { setUpdateKeyFilterDesktop } from 'Store/Search';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
interface Props {
  handleClose?: any;
  // onChangeKeyFilter?: any;
}

function FilterComponent(props: Props) {
  const { handleClose } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const [resultFilter, setResultFilter] = useState<any>([]);
  const [valueSearch, setValueSearch] = useState<string>('');
  const [itemChoose, setItemChoose] = useState<string>('');
  const [keyFilter, setKeyFilter] = useState<string | null>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    getDataFilterDesktop();
  }, []);

  useEffect(() => {
    if (!valueSearch) {
      getDataFilterDesktop();
    }
    handerFilterSearch(valueSearch);
  }, [valueSearch]);

  const getDataFilterDesktop = async () => {
    const dataResultFilter = getFilters(1000, settings)
      .then(res => {
        const arrResult = res[0].values;
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

  const handerFilterSearch = async (value: any) => {
    if (!value) return;
    const data = await searchFilters('machineType', value, settings)
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
        console.log('err handerFilterSearch', e);
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
    >
      <Box
        className="box-top"
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Box
          className="box-input-search-filter"
          display={'flex'}
          justifyItems={'center'}
        >
          {!keyFilter && (
            <Box
              className="icon-search"
              style={{ marginRight: 11 }}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <img src={IconSearch} alt="" width={18} height={18} />
            </Box>
          )}

          {keyFilter && (
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
            style={{ minWidth: 512 }}
            value={valueSearch}
            onChange={(e: any) => {
              setValueSearch(e.target.value);
            }}
          />
        </Box>
        <Button onClick={handleClose}>
          <CloseIcon />
        </Button>
      </Box>
      <Box
        className="box-bottom"
        height={'100%'}
        style={
          columns <= 4
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
      {itemChoose && (
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
    </Box>
  );
}

export default FilterComponent;
