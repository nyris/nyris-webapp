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
import useMachineStore from 'stores/machine/machineStore';

function Header() {
  const { theme, auth0 } = window.settings;
  const { isAuthenticated, user, logout } = useAuth0();
  let location = useLocation();

  const reset = useRequestStore(state => state.reset);
  const resetResultStore = useResultStore(state => state.reset);
  const setMachineName = useMachineStore(state => state.setMachineName);
  const showSearchBar = location?.pathname === '/result';

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
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
            reset();
            resetResultStore();
            setMachineName('');
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
              <Popover>
                <PopoverTrigger>
                  <div
                    style={{
                      display: 'flex',
                      columnGap: '16px',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
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
      <LogoutModal
        setShowLogoutModal={setShowLogoutModal}
        showModal={showLogoutModal}
      />
    </div>
  );
}

export default Header;
