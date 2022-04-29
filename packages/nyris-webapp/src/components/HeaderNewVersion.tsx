import { Box, Grid } from "@material-ui/core";
import React from "react";
import { NavLink } from "react-router-dom";
import "./common.scss";
import IconReLoad from "common/assets/icons/reload_icon.svg";
import IconSave from "common/assets/icons/save_search.svg";
import IconSupport from "common/assets/icons/support.svg";
import IconAdmin from "common/assets/icons/admin.svg";
import LogoNyris from "common/assets/icons/nyris_logo.svg";
function HeaderNewVersion(): JSX.Element {
  const handleCheckMatchLink = (match: any, location: any) => {
    let active = false;
    if (match?.url === location.pathname) {
      active = true;
    }

    return active;
  };

  return (
    <Box className="box-content" display={"flex"}>
      <NavLink to="/" style={{ lineHeight: 0 }}>
        {/* <section id="branding" style={{ height: 32 }} /> */}
        <img width={74} height={19} src={`${LogoNyris}`} alt="nyris logo" />
      </NavLink>
      <Grid container className="nav-menu">
        <Grid item className="item-nav">
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
        <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={"/support"}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              Support
              <img width={10} height={10} src={`${IconSupport}`} alt="" />
            </span>
          </NavLink>
        </Grid>
        <Grid item className="item-nav">
          <NavLink
            activeClassName="active"
            isActive={(match, location) =>
              handleCheckMatchLink(match, location)
            }
            to={"/account"}
            className="nav-link p-0 menu-children rounded-0"
          >
            <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
              My Account
              <img width={10} height={10} src={`${IconAdmin}`} alt=""/>
            </span>
          </NavLink>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HeaderNewVersion;
