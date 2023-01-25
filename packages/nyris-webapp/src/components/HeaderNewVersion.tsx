import { Box, Grid } from '@material-ui/core';
import React from 'react';
import { NavLink } from 'react-router-dom';
import './common.scss';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { reset } from 'Store/Search';
function HeaderNewVersion(): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);

  // const handleCheckMatchLink = (match: any, location: any) => {
  //   let active = false;
  //   if (match?.url === location.pathname) {
  //     active = true;
  //   }

  //   return active;
  // };

  return (
    <Box className="box-content" display={'flex'}>
      <NavLink
        to="/"
        style={{ lineHeight: 0 }}
        onClick={() => {
          dispatch(reset(''));
        }}
      >
        {/* <section id="branding" style={{ height: 32 }} /> */}
        <img
          width={74}
          height={19}
          src={settings.themePage.searchSuite?.appBarLogoUrl}
          alt={settings.themePage.searchSuite?.appBarLogoUrlAlt}
        />
      </NavLink>
      <Grid container className="nav-menu">
        {/* <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={"/search-history"}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              Search history
              <img width={10} height={10} src={`${IconReLoad}`} alt=""/>
            </span>
          </NavLink>
        </Grid>
        <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={"/saved"}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              Saved
              <img width={10} height={10} src={`${IconSave}`} alt=""/>
            </span>
          </NavLink>
        </Grid>
         */}

        {/*hidden_as_required
        <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={'/support'}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              Support
              <img width={20} height={20} src={`${IconSupport}`} alt="" />
            </span>
          </NavLink>
        </Grid>


        <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={'/account'}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              My Account
              <img width={20} height={20} src={`${IconAdmin}`} alt="" />
            </span>
          </NavLink>
        </Grid>*/}
      </Grid>
    </Box>
  );
}

export default HeaderNewVersion;
