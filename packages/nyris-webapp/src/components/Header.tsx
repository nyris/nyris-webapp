import { Menu, MenuProps, withStyles } from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import './common.scss';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { reset, setPreFilter } from 'Store/search/Search';
import { useAuth0 } from '@auth0/auth0-react';
import { ReactComponent as AvatarIcon } from 'common/assets/icons/avatar.svg';
import MenuItem from '@material-ui/core/MenuItem';
import CustomSearchBox from "./input/inputSearch";


function Header(): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);
  const { user, isAuthenticated, logout } = useAuth0();
  const auth0 = settings.auth0;
  const history = useHistory();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    if (history.location?.pathname === '/') {
      setShowSearchBar(false);
    } else {
      setShowSearchBar(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const StyledMenu = withStyles({
    root: {},
    paper: {
      border: '0px',
      boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
      top: '58px !important',
      borderRadius: '0px !important',
    },
  })((props: MenuProps) => (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      {...props}
    />
  ));

  const StyledMenuItem = withStyles(theme => ({
    root: {
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.white,
        },
      },
      padding: '0px',
    },
  }))(MenuItem);

  return (
    <div className="box-content" style={{ display: 'flex', position: 'relative' }}>
      <a
        href={window.location.origin}
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
      </a>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: showSearchBar ? 'block' : 'none'
        }}
      >
        <CustomSearchBox />
      </div>

      {auth0.enabled && isAuthenticated && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              columnGap: '16px',
              alignItems: 'center',
              paddingRight: '24px',
              cursor: 'pointer',
            }}
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <p style={{ color: '#2B2C46' }}>{user?.email}</p>
            <AvatarIcon />
          </div>
          <StyledMenu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <StyledMenuItem>
              <div
                style={{
                  display: 'flex',
                  width: '152px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.20)',
                  // position: 'absolute',
                  // zIndex: 99,
                  // top: '50px',
                  backgroundColor: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '75px',
                    height: '24px',
                    padding: '4px 8px',
                    alignItems: 'center',
                    backgroundColor: '#2B2C46',
                    color: '#fff',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    });
                  }}
                >
                  Sign out
                </div>
              </div>
            </StyledMenuItem>
          </StyledMenu>
        </div>
      )}
    </div>
  );
}

export default Header;
