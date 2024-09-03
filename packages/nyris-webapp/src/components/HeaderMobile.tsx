import { memo, useEffect, useMemo, useState } from 'react';

import { connectSearchBox, connectStateResults } from 'react-instantsearch-dom';
import { NavLink, useHistory } from 'react-router-dom';

import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';

import { reset, setPreFilter, updateQueryText } from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

import { ReactComponent as FilterIcon } from 'common/assets/icons/filter.svg';
import { ReactComponent as LogoutIcon } from 'common/assets/icons/logout.svg';
import { ReactComponent as CameraSimpleIcon } from 'common/assets/icons/camera_simple.svg';
import { ReactComponent as PreFilterIcon } from 'common/assets/icons/filter_settings.svg';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';

import { useQuery } from 'hooks/useQuery';
import DefaultModal from './modal/DefaultModal';
import useRequestStore from 'Store/requestStore';
import CameraCustom from './drawer/cameraCustom';
import UploadDisclaimer from './UploadDisclaimer';
import PreFilterComponent from './pre-filter';
import { useSearchOrRedirect } from 'hooks/useSearchOrRedirect';

interface Props {
  onToggleFilterMobile?: any;
  refine?: any;
  allSearchResults?: any;
}

function HeaderMobileComponent(props: Props): JSX.Element {
  const { onToggleFilterMobile, refine } = props;

  const { user, isAuthenticated, logout } = useAuth0();

  const dispatch = useAppDispatch();
  const query = useQuery();
  const history = useHistory();

  const auth0 = useAppSelector(state => state.settings.auth0);

  const preFilter = useAppSelector(state => state.search.preFilter);
  const valueTextSearch = useAppSelector(state => state.search.valueTextSearch);
  const queryText = useAppSelector(state => state.search.queryText);
  const results = useAppSelector(state => state.search.results);
  const postFilter = useAppSelector(state => state.search.postFilter);
  const settings = useAppSelector(state => state.settings);

  const isAlgoliaEnabled = settings.algolia?.enabled;

  const { resetRequestState, requestImages } = useRequestStore(state => ({
    resetRequestState: state.reset,
    requestImages: state.requestImages,
  }));

  const [isShowFilter, setShowFilter] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [preFilterDropdown, setPreFilterDropdown] = useState(false);

  const [valueInput, setValueInput] = useState<string>(queryText || '');
  const searchQuery = query.get('query') || '';
  const visualSearch = useMemo(() => requestImages.length > 0, [requestImages]);

  useEffect(() => {
    if (
      history.location?.pathname === '/result' &&
      (visualSearch || valueInput)
    ) {
      setShowFilter(true);
    } else {
      setShowFilter(false);
    }
  }, [history.location, valueInput, visualSearch]);

  useEffect(() => {
    if (visualSearch) {
      history.push('/result');
      setValueInput('');
      if (isAlgoliaEnabled) {
        refine('');
      } else {
        dispatch(updateQueryText(''));
      }
    } else {
      if (isAlgoliaEnabled) {
        // not an ideal solution: fixes text search not working after removing image
        setTimeout(() => {
          refine(searchQuery);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSearch, dispatch, refine, history, isAlgoliaEnabled]);

  useEffect(() => {
    if (!isEmpty(searchQuery)) {
      setValueInput(searchQuery);
      if (isAlgoliaEnabled) {
        refine(searchQuery);
        // not an ideal solution: fixes text search not working from landing page
        setTimeout(() => {
          refine(searchQuery);
        }, 100);
      } else {
        dispatch(updateQueryText(searchQuery));
      }
    }
  }, [query, refine, dispatch, searchQuery, isAlgoliaEnabled]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchOrRedirect = useSearchOrRedirect();

  const isPostFilterApplied = useMemo(() => {
    let isApplied = false;

    if (isAlgoliaEnabled) {
      if (!valueTextSearch?.refinementList) return false;
      Object.keys(valueTextSearch?.refinementList).forEach(key => {
        if (typeof valueTextSearch.refinementList[key] === 'object') {
          isApplied = true;
          return;
        }
      });
    } else {
      Object.keys(postFilter).forEach(key => {
        const filter = postFilter[key];
        Object.keys(filter).forEach(value => {
          if (filter[value]) {
            isApplied = true;
            return;
          }
        });
      });
    }

    return isApplied;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueTextSearch?.refinementList, settings, postFilter]);

  const onChangeText = (event: any) => {
    setValueInput(event.currentTarget.value);
    searchOrRedirect(event.currentTarget.value);
    if (event.currentTarget.value === '') {
      setValueInput('');
      if (isAlgoliaEnabled) {
        refine('');
      }
    }
  };

  const disablePostFilter = useMemo(() => {
    if (isAlgoliaEnabled) {
      return settings.postFilterOption &&
        props.allSearchResults?.hits.length > 0
        ? false
        : true;
    } else {
      return settings.postFilterOption && results?.length > 0 ? false : true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, results, props.allSearchResults?.hits]);

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata'].value) {
        return true;
      }
      return false;
    }

    return settings.preFilterOption;
  }, [settings.preFilterOption, settings.shouldUseUserMetadata, user]);

  const showDisclaimerDisabled = useMemo(() => {
    const disclaimer = localStorage.getItem('upload-disclaimer-webapp');
    if (requestImages.length === 0) return true;
    if (!disclaimer) return false;
    return disclaimer === 'dont-show';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer, requestImages]);

  return (
    <>
      {preFilterDropdown && (
        <div
          className={`box-filter open`}
          style={{
            top: '0px',
            height: '100%',
            width: '100%',
            zIndex: 999,
            position: 'absolute',
          }}
        >
          <div style={{ width: '100%' }} className={'wrap-filter-desktop'}>
            <div className={'bg-white box-filter-desktop isMobile'}>
              <PreFilterComponent
                handleClose={() => setPreFilterDropdown(s => !s)}
              />
            </div>
          </div>
        </div>
      )}
      <DefaultModal
        openModal={showLogoutModal}
        handleClose={() => {
          setShowLogoutModal(false);
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '360px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setShowLogoutModal(false)}
          >
            <CloseIcon
              width={'16px'}
              height={'16px'}
              fontSize={'16px'}
              color="black"
            />
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2B2C46' }}>
            Logout
          </p>
          <p style={{ fontSize: '13px', color: '#2B2C46', paddingTop: '16px' }}>
            Are you sure you want to log out? Your session will be securely
            closed.
          </p>
          <p style={{ fontSize: '13px', color: '#2B2C46', paddingTop: '16px' }}>
            Email
          </p>
          <div
            style={{
              backgroundColor: '#FAFAFA',
              height: '32px',
              paddingLeft: '16px',
              paddingRight: '16px',
              marginTop: '8px',
            }}
          >
            {user?.email}
          </div>
          <div style={{ display: 'flex', width: '100%', marginTop: '16px' }}>
            <div
              style={{
                width: '50%',
                backgroundColor: '#2B2C46',
                color: 'white',
                padding: '16px',
              }}
              onClick={() => {
                logout({
                  logoutParams: { returnTo: window.location.origin },
                });
              }}
            >
              Confirm log out
            </div>
          </div>
        </div>
      </DefaultModal>
      {showDisclaimer && (
        <UploadDisclaimer
          onClose={() => {
            setShowDisclaimer(false);
          }}
          onContinue={({
            file,
            dontShowAgain,
          }: {
            file: any;
            dontShowAgain: any;
          }) => {
            if (dontShowAgain) {
              localStorage.setItem('upload-disclaimer-webapp', 'dont-show');
            }
            setOpenModalCamera(true);

            setShowDisclaimer(false);
          }}
          isMobile={true}
        />
      )}
      <div style={{ width: '100%', background: '#fff' }}>
        <div
          className={`box-content flex items-center justify-between h-12 pr-6 pl-4 ${
            history.location?.pathname === '/result'
              ? 'border-solid border-b border-[#afafaf52] '
              : ''
          }`}
          style={{
            background: settings.theme?.headerColor,
          }}
        >
          <NavLink
            to="/"
            style={{ lineHeight: 0 }}
            onClick={() => {
              dispatch(reset(''));
              dispatch(setPreFilter({}));
              resetRequestState();
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
          {auth0.enabled && isAuthenticated && (
            <div
              onClick={() => {
                setShowLogoutModal(true);
              }}
            >
              <LogoutIcon className="text-[#AAABB5]" />
            </div>
          )}
        </div>

        <div
          className={classNames([
            'flex',
            'md:hidden',
            'fixed',
            history.location?.pathname !== '/' ? 'bottom-4' : 'bottom-12',
            'w-full',
            'px-2',
            'gap-2',
          ])}
        >
          <div className={classNames(['flex-grow'])}>
            <div
              className={classNames([
                'h-12',
                'rounded-3xl',
                'shadow-outer',
                'w-full',
                'bg-white',
                'px-2',
                'flex',
                'items-center',
                'justify-between',
              ])}
            >
              <div className="flex flex-1 gap-x-2">
                {showPreFilter && (
                  <button
                    className={classNames([
                      '!min-w-8',
                      'min-h-8',
                      'rounded-3xl',
                      'flex',
                      'justify-center',
                      'items-center',
                      'bg-[#F3F3F5]',
                      'relative',
                    ])}
                    onClick={() => {
                      setPreFilterDropdown(s => !s);
                    }}
                    title="pre-filter"
                  >
                    <div
                      className={classNames([
                        !isEmpty(preFilter) ? 'block' : 'hidden',
                        'absolute',
                        'top-0',
                        'right-0',
                        'w-2',
                        'min-w-2',
                        'h-2',
                        'bg-[#3E36DC]',
                        'border-2',
                        'border-white',
                        'rounded-full',
                      ])}
                    />
                    <PreFilterIcon
                      className={classNames(
                        !isEmpty(preFilter) ? 'text-[#3E36DC]' : 'text-black',
                      )}
                    />
                  </button>
                )}

                <Input value={valueInput} onChange={onChangeText} />
              </div>
              <div className="flex gap-x-2">
                {/* <div
                className={classNames([
                  'w-8',
                  'h-8',
                  'rounded-3xl',
                  'flex',
                  'justify-center',
                  'items-center',
                  valueInput.length > 0 ? 'bg-[#2B2C46]' : 'bg-[#F3F3F5]',
                  valueInput.length > 0 ? 'cursor-pointer' : 'cursor-default',
                ])}
              >
                <ArrowEnter className="text-white" />
                
              </div> */}
                <div
                  className={classNames([
                    history.location?.pathname !== '/' ? 'flex' : 'hidden',
                    'w-8',
                    'h-8',
                    'rounded-3xl',
                    'justify-center',
                    'items-center',
                    'bg-[#F3F3F5]',
                  ])}
                  onClick={() => {
                    if (!showDisclaimerDisabled) {
                      setShowDisclaimer(true);
                    } else {
                      setOpenModalCamera(true);
                    }
                  }}
                >
                  <CameraSimpleIcon />
                </div>
              </div>
            </div>
          </div>
          {isShowFilter && settings.postFilterOption && (
            <div
              style={{
                position: 'relative',
                width: '48px',
                height: '48px',
                padding: ' 8px',
                flexShrink: 0,
                borderRadius: '32px',
                background: '#FAFAFA',
                boxShadow: ' 0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
              }}
              onClick={() => {
                if (disablePostFilter) return;
                onToggleFilterMobile();
                setPreFilterDropdown(false);
              }}
            >
              <div
                style={{
                  display: 'flex',
                  background: `${
                    disablePostFilter
                      ? '#F3F3F5'
                      : isPostFilterApplied
                      ? '#F0EFFF'
                      : '#F3F3F5'
                  }`,
                  borderRadius: '40px',
                  width: '32px',
                  height: '32px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FilterIcon
                  className={classNames([
                    isPostFilterApplied ? 'text-[#3E36DC]' : 'text-[#2B2C46]',
                  ])}
                  // color={`${disablePostFilter ? '#E0E0E0' : '2B2C46'}`}
                />
              </div>

              {isPostFilterApplied && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '35px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white',
                    width: '10px',
                    height: '10px',
                    borderRadius: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      background: disablePostFilter
                        ? '#E0E0E0'
                        : settings.theme?.primaryColor,
                      borderRadius: '100%',
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
        <CameraCustom
          show={isOpenModalCamera}
          onClose={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
          newSearch={true}
        />
      </div>
    </>
  );
}

const HeaderMobile = connectSearchBox<any>(
  memo(connectStateResults<Props>(HeaderMobileComponent)),
);
export default HeaderMobile;

const INPUT_ID = 'mobile-input-search';

const Input = ({ value, onChange }: any) => {
  useEffect(() => {
    const element = document.getElementById(INPUT_ID);
    const inputEventFn = (keyboardEvent: any) => {
      if (keyboardEvent.key === 'Enter') {
        element?.blur();
      }
    };

    element?.addEventListener('keyup', inputEventFn, false);

    return () => {
      element?.removeEventListener('scroll', inputEventFn, false);
    };
  }, []);
  const { t } = useTranslation();

  return (
    <input
      style={{
        border: '0px',
        width: '100%',
        display: 'flex',
        flexGrow: 1,
        fontSize: 14,
        paddingLeft: '12px',
        paddingRight: '4px',
        color: '#2B2C46',
        outline: 'none',
        borderRadius: '32px',
      }}
      className="input-search"
      placeholder={t('Search')}
      value={value}
      onChange={onChange}
      id={INPUT_ID}
    />
  );
};
