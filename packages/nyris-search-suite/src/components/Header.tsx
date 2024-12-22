import React from 'react';
import { NavLink, useLocation } from 'react-router';

import { useAuth0 } from '@auth0/auth0-react';

import { twMerge } from 'tailwind-merge';

import { Icon } from '@nyris/nyris-react-components';
import TextSearch from './TextSearch';

function Header() {
  const { theme, auth0 } = window.settings;
  const { isAuthenticated, user } = useAuth0();
  let location = useLocation();

  const showSearchBar = location?.pathname === '/result';

  return (
    <>
      <div
        className={twMerge([
          'h-12',
          'desktop:h-[58px]',
          'desktop:min-h-[58px]',
          location?.pathname === '/result' &&
            'border-solid border-b border-[#afafaf52]',
          'desktop:border-solid desktop:border-b desktop:border-[#E0E0E0]',
          'pr-6',
          'pl-4',
          'w-full',
          'flex-shrink-0',
        ])}
        style={{ background: theme?.headerColor }}
      >
        <div
          className={twMerge([
            'flex',
            'justify-between',
            'items-center',
            'relative',
            'h-full',
          ])}
        >
          <NavLink
            to="/"
            style={{ lineHeight: 0 }}
            onClick={() => {
              // dispatch(reset(''));
              // dispatch(setPreFilter({}));
              // resetRequestState();
            }}
          >
            <img
              src={theme?.appBarLogoUrl}
              alt="logo"
              style={{
                aspectRatio: 1,
                width: theme?.logoWidth,
                height: theme?.logoHeight,
              }}
            />
          </NavLink>
          <div
            className={twMerge(['hidden', showSearchBar && 'desktop:block'])}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <TextSearch />
          </div>

          {auth0.enabled && isAuthenticated && (
            <>
              <div
                className="hidden desktop:block"
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    display: 'flex',
                    columnGap: '16px',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={() => {}}
                >
                  <p style={{ color: '#2B2C46' }}>{user?.email}</p>
                  <Icon name="avatar" />
                </div>
              </div>

              <div
                className="block desktop:hidden"
                onClick={() => {
                  //   setShowLogoutModal(true);
                }}
              >
                <Icon
                  name="logout"
                  className="text-[#AAABB5]"
                  width={24}
                  height={24}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
