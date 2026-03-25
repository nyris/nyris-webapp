import { NavLink, useLocation } from 'react-router';

import { useAuth0 } from '@auth0/auth0-react';
import { twMerge } from 'tailwind-merge';

import { Icon } from '@nyris/nyris-react-components';

import TextSearch from './TextSearch';
import useRequestStore from 'stores/request/requestStore';
import { useState } from 'react';
import LogoutModal from './LogoutModal';
import useResultStore from 'stores/result/resultStore';
import Cart from './Cart';
import useUiStore from 'stores/ui/uiStore';

function Header() {
  const { theme, auth0 } = window.settings;
  const { isAuthenticated, user, logout } = useAuth0();
  let location = useLocation();

  const reset = useRequestStore(state => state.reset);
  const resetResultStore = useResultStore(state => state.reset);
  const setSpecifications = useRequestStore(state => state.setSpecifications);
  const showSidePanel = useUiStore(state => state.showSidePanel);
  const setShowSidePanel = useUiStore(state => state.setShowSidePanel);

  const showSearchBar = location?.pathname === '/result';

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div
      className={twMerge([
        'desktop:h-[68px]',
        'desktop:min-h-[68px]',
        'px-4',
        'w-full',
        'flex-shrink-0',
        'bg-transparent',
        'mt-4',
        'mb-2',
        'flex',
        'gap-2',
        'justify-between',
        'desktop:items-start',
      ])}
    >
      {location?.pathname === '/result' && (
        <div
          className={twMerge(
            'hidden desktop:flex',
            'min-w-[68px] h-[68px]',
            'border border-solid border-[#DDDEE7] items-center justify-center cursor-pointer bg-white',
            'rounded-2xl',
            'shadow-ds-1',
          )}
          onClick={() => {
            setShowSidePanel(!showSidePanel);
          }}
        >
          <Icon name={showSidePanel ? 'close' : 'hamburger'} />
        </div>
      )}

      <div
        className={twMerge(
          'min-w-[268px] h-[68px] flex items-center justify-between',
          'border border-solid border-[#DDDEE7]',
          'bg-white',
          'rounded-2xl',
          'shadow-ds-1',
          location?.pathname === '/result' && 'flex-grow',
        )}
      >
        <NavLink
          to="/"
          style={{ lineHeight: 0 }}
          onClick={() => {
            reset();
            resetResultStore();
            setSpecifications(null);
          }}
          className="pl-6"
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
          className={twMerge([
            'hidden',
            showSearchBar && 'desktop:flex',
            'flex-1',
            'justify-center',
            'min-w-0',
          ])}
        >
          <TextSearch className="w-full max-w-[531px] min-w-0" />
        </div>

        {auth0.enabled &&
          isAuthenticated &&
          location?.pathname === '/result' && (
            <>
              <div
                className={twMerge(
                  'cursor-pointer w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center',
                  'mr-3.5',
                )}
                onClick={() => {
                  setShowLogoutModal(true);
                }}
              >
                <Icon
                  name="logout"
                  className="text-black"
                  width={16}
                  height={16}
                />
              </div>
            </>
          )}
      </div>
      <div className="flex gap-2">
        {auth0.enabled &&
          isAuthenticated &&
          location?.pathname !== '/result' && (
            <>
              <div
                className={twMerge(
                  'min-w-[68px] h-[68px] bg-white rounded-2xl flex items-center justify-center ',
                  'border border-solid border-[#DDDEE7]',
                  'shadow-ds-1',
                )}
              >
                <button
                  className={twMerge(
                    'relative flex items-center justify-center rounded-2xl',
                    'h-10 w-10',
                  )}
                  style={{
                    backgroundColor: '#FAFAFA',
                  }}
                  onClick={() => {
                    setShowLogoutModal(true);
                  }}
                >
                  <Icon name="logout" className={twMerge('text-[#BBBDCF]')} />
                </button>
              </div>
            </>
          )}
        {window.settings.cart && <Cart />}
      </div>

      <LogoutModal
        setShowLogoutModal={setShowLogoutModal}
        showModal={showLogoutModal}
      />
    </div>
  );
}

export default Header;
