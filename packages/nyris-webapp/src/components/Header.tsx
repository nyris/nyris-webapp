import { Box } from '@material-ui/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
import './common.scss';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { reset, setPreFilter } from 'Store/search/Search';

function Header(): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);
  return (
    <Box className="box-content" display={'flex'}>
      <NavLink
        to="/"
        style={{ lineHeight: 0, paddingLeft: '10px' }}
        onClick={() => {
          dispatch(reset(''));
          dispatch(setPreFilter({}));
        }}
      >
        <img
          src={settings.theme?.appBarLogoUrl}
          alt="logo"
          style={{
            aspectRatio: 1,
            width: settings.theme?.logoWidth,
            height: settings.theme?.logoHeight,
          }}
        />
      </NavLink>
    </Box>
  );
}

export default Header;
