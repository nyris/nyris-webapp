import { NavLink, useLocation } from 'react-router';

import { useAuth0 } from '@auth0/auth0-react';
import { twMerge } from 'tailwind-merge';

import { Icon } from '@nyris/nyris-react-components';

import TextSearch from './TextSearch';
import useRequestStore from 'stores/request/requestStore';
import { useState } from 'react';
import LogoutModal from './LogoutModal';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import useResultStore from 'stores/result/resultStore';
import Cart from './Cart';
import useUiStore from 'stores/ui/uiStore';
import ImageUpload from './ImageUpload';

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
        'desktop:h-[48px]',
        'desktop:min-h-[48px]',
        // 'border-solid border-b border-[#afafaf52]',
        // 'desktop:border-solid desktop:border-b desktop:border-[#E0E0E0]',
        'pr-4',
        'pl-4',
        'w-full',
        'flex-shrink-0',
        'bg-transparent',
        'mt-4',
        'mb-3',
        'flex',
        'gap-[10px]',
        'justify-between',
        'desktop:items-start',
      ])}
    >
      {location?.pathname === '/result' && (
        <div
          className={twMerge(
            'hidden desktop:flex',
            'min-w-[56px] h-[56px]',
            'border border-solid border-[#CACAD1] items-center justify-center cursor-pointer bg-white',
            'rounded-2xl',
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
          'min-w-[268px] w-[313px] desktop:w-[268px] h-[56px] border border-solid border-[#CACAD1] flex items-center justify-between cursor-pointer bg-white',
          'rounded-2xl',
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

        {auth0.enabled && isAuthenticated && (
          <>
            <div
              className="hidden desktop:block"
              style={{ position: 'relative' }}
            >
              <Popover>
                <PopoverTrigger>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    className="h-14 w-6"
                  >
                    <p style={{ color: '#2B2C46' }}>{user?.email}</p>
                    <Icon name="avatar" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[152px] bg-white p-2 shadow-outer">
                  <div
                    className={twMerge([
                      'flex',
                      'w-[75px]',
                      'h-[24px]',
                      'px-2',
                      'items-center',
                      'bg-[#2B2C46]',
                      'text-white',
                      'text-[10px]',
                      'cursor-pointer',
                    ])}
                    onClick={() => {
                      logout({
                        logoutParams: { returnTo: window.location.origin },
                      });
                    }}
                  >
                    Sign out
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div
              className="block desktop:hidden cursor-pointer"
              onClick={() => {
                setShowLogoutModal(true);
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
      <div className="w-fit desktop:w-full flex items-center min-w-0 gap-2">
        <div
          className={twMerge([
            'hidden',
            showSearchBar && 'desktop:flex',
            'gap-2',
            'flex-1',
            'justify-center',
            'min-w-0',
          ])}
        >
          <TextSearch className="w-full max-w-[531px] min-w-0" />
          <ImageUpload />
        </div>
        <div className="ml-auto flex justify-end min-w-0">
          <Cart />
        </div>
      </div>
      <LogoutModal
        setShowLogoutModal={setShowLogoutModal}
        showModal={showLogoutModal}
      />
    </div>
  );
}

export default Header;
