import { memo, useEffect, useRef, useState } from 'react';
import { get } from 'lodash';

import { Icon } from '@nyris/nyris-react-components';

import ProductAttribute from './ProductAttribute';
import { truncateString } from 'utils/truncateString';
import { ToastHelper } from 'helpers/ToastHelper';

import '../../styles/product.scss';
import { twMerge } from 'tailwind-merge';

import NoImage from '../../common/assets/images/no-image.svg';
import ProductDetailViewModal from './ProductDetailViewModal';
import Tooltip from 'components/Tooltip/TooltipComponent';

interface Props {
  dataItem: any;
  handlerToggleModal?: any;
  handleClose?: () => void;
  isHover?: boolean;
  indexItem: number;
  onSearchImage?: any;
  handlerFeedback?: any;
  handlerGroupItem?: any;
  isGroupItem?: boolean;
  handlerCloseGroup?: any;
  main_image_link?: any;
}

function Product(props: Props) {
  const {
    dataItem,
    isHover = false,
    onSearchImage,
    handlerFeedback,
    main_image_link,
  } = props;
  const [urlImage, setUrlImage] = useState<string>('');
  const settings = window.settings;
  const [copiedKey, setCopiedKey] = useState<'main' | 'secondary' | null>(null);
  const copyTimeoutRef = useRef<number | undefined>(undefined);

  const [openDetailedView, setOpenDetailedView] = useState<
    '3d' | 'image' | undefined
  >();

  useEffect(() => {
    if (main_image_link) {
      handlerCheckUrlImage(main_image_link);
    }
  }, [main_image_link]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handlerCheckUrlImage = (url: any, timeout?: number) => {
    timeout = timeout || 5000;
    var timedOut = false,
      timer: any;
    var img = new Image();
    img.onerror = img.onabort = function () {
      if (!timedOut) {
        clearTimeout(timer);
        setUrlImage('');
      }
    };
    img.onload = function () {
      if (!timedOut) {
        clearTimeout(timer);
        setUrlImage(url);
        return;
      }
    };
    img.src = url;
  };

  const handlerToggleModal = (item: any) => {
    setOpenDetailedView('image');
  };

  const onAddToCart = (part: any): void => {
    // Get current cart from sessionStorage
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    // Find if part already exists in cart
    const partIndex = cart.findIndex((p: any) => p.sku === part.sku);
    if (partIndex === -1) {
      // Add new part with quantity 1
      cart.push({ ...part, quantity: 1 });
    } else {
      // Increment quantity
      cart[partIndex] = {
        ...cart[partIndex],
        quantity: cart[partIndex].quantity + 1,
      };
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    ToastHelper.success('Product added');
  };

  const handleCopy = (value: string, key: 'main' | 'secondary') => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedKey(null);
    }, 1000);
  };

  return (
    <>
      <ProductDetailViewModal
        dataItem={dataItem}
        handlerFeedback={handlerFeedback}
        onSearchImage={onSearchImage}
        openDetailedView={openDetailedView}
        setOpenDetailedView={setOpenDetailedView}
        main_image_link={main_image_link}
        onAddToCart={onAddToCart}
      />
      <div
        className={twMerge(
          'wrap-main-item-result',
          'max-w-[190px] w-[180px] desktop:w-[190px]',
          'border border-solid border-[#E7E8F1]',
          'scroll-pt-5',
          'shadow-ds-1',
          'rounded-2xl',
        )}
      >
        <div className="relative h-fit">
          {!isHover && main_image_link && !settings.noSimilarSearch && (
            <div
              className="box-icon-modal"
              onClick={() => {
                if (urlImage.length > 1) {
                  onSearchImage(main_image_link);
                }
              }}
            >
              <Icon
                name="search_image"
                width={16}
                height={16}
                color={'#AAABB5'}
              />
            </div>
          )}
          {settings.cadenas?.cadenas3dWebView && (
            <div
              className="box-icon-modal-3d"
              onClick={() => {
                setOpenDetailedView('3d');
              }}
            >
              <Icon name="box3d" width={16} height={16} color={'black'} />
            </div>
          )}

          <div
            className={twMerge([
              'text-center',
              'bg-white',
              'h-[168px]',
              'z-10',
              'relative',
            ])}
          >
            <div
              className={twMerge([
                'w-full',
                'h-full',
                'cursor-pointer',
                'flex',
                'justify-center',
                'items-center',
              ])}
              onClick={(e: any) => {
                e.preventDefault();
                handlerToggleModal(dataItem);
              }}
            >
              {main_image_link && (
                <img
                  src={main_image_link}
                  key={main_image_link}
                  alt=""
                  className="img-style product-image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}

              {!main_image_link && (
                <img
                  src={NoImage}
                  alt="image_item"
                  style={{ width: '70%', height: '50%' }}
                />
              )}
            </div>
          </div>
        </div>
        {settings.simpleCardView && (
          <div
            className={`info-container-card ${settings.CTAButton?.CTAButton ? 'w-cta' : ''}`}
          >
            <div className="info-sku">{dataItem.sku}</div>
            <span className="info-marking">{dataItem.Bezeichnung}</span>
            <Tooltip
              content={
                settings.language === 'en'
                  ? dataItem.VK_Text_Englisch
                  : dataItem.VK_Text_Deutsch
              }
              disabled={
                settings.language === 'en'
                  ? dataItem.VK_Text_Englisch?.length < 76
                  : dataItem.VK_Text_Deutsch?.length < 76
              }
            >
              <div className="info-description">
                {settings.language === 'en'
                  ? dataItem.VK_Text_Englisch
                  : dataItem.VK_Text_Deutsch}
              </div>
            </Tooltip>
            {settings.CTAButton?.CTAButton && (
              <div
                style={{
                  boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                  minHeight: 28,
                  background:
                    settings.CTAButton?.CTAButtonColor ||
                    settings.theme?.primaryColor,
                  borderRadius: 2,
                  paddingLeft: '8px',
                  display: 'flex',
                  justifyItems: 'center',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: 0,
                    cursor: settings.CTAButton?.CTALinkField
                      ? 'pointer'
                      : 'normal',
                  }}
                  onClick={() => {
                    if (settings.CTAButton?.CTALinkField) {
                      // feedbackConversionEpic(state, indexItem, dataItem.sku);
                      window.open(
                        `${get(dataItem, settings.CTAButton?.CTALinkField)}`,
                        '_blank',
                      );
                    }
                  }}
                >
                  <Tooltip
                    content={
                      get(dataItem, settings.CTAButton?.CTAButtonText || '') ||
                      settings.CTAButton?.CTAButtonText ||
                      ''
                    }
                  >
                    <div
                      className={`max-line-1 ${
                        settings.CTAButton.CTALinkField
                          ? 'desktop:136px'
                          : '164px'
                      }`}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        color:
                          settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                        fontSize: '12px',
                        letterSpacing: '0.27px',
                        wordBreak: 'break-word',
                        paddingRight: '8px',
                      }}
                    >
                      {get(dataItem, settings.CTAButton?.CTAButtonText || '') ||
                        settings.CTAButton?.CTAButtonText}
                    </div>
                  </Tooltip>
                  {settings.CTAButton?.CTAIcon && (
                    <div style={{ width: '16px' }}>
                      <Icon
                        name="link"
                        fill={
                          settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'
                        }
                        width={16}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!settings.simpleCardView && (
          <div
            className={twMerge([
              'pl-2',
              'pr-2',
              'pb-3',
              'justify-between',
              'flex',
              'flex-col',
              'bg-[#fff]',
              'flex-grow',
              'z-10',
              'pt-2',
            ])}
          >
            <div
              className="relative text-primary flex flex-col justify-between h-full"
              style={{ color: '#FFFFFF' }}
            >
              <div className="h-full flex flex-col">
                <div className="flex flex-col gap-1 mb-1.5">
                  {dataItem[settings.mainTitle] && (
                    <div className="flex justify-between gap-1">
                      <Tooltip content={dataItem[settings.mainTitle] || ''}>
                        <div
                          className="text-xs font-bold text-primary ml-2 max-line-1 w-fit"
                          style={{
                            wordBreak: 'break-word',
                            maxHeight: 46,
                            WebkitLineClamp: 3,
                          }}
                        >
                          {truncateString(dataItem[settings.mainTitle], 92)}
                        </div>
                      </Tooltip>
                      <div
                        onClick={() => {
                          handleCopy(dataItem[settings.mainTitle], 'main');
                        }}
                        className="group relative min-w-6 h-6 desktop:min-w-[18px] desktop:w-[18px] desktop:h-[18px] bg-[#FAFAFA] hover:bg-gray-100 flex items-center justify-center rounded-md cursor-pointer"
                      >
                        {copiedKey === 'main' && (
                          <div className="absolute -top-3.5 -right-2 bg-[#2B2C46] text-white text-[10px] py-0 px-1 rounded shadow pointer-events-none">
                            Copied!
                          </div>
                        )}
                        <Icon
                          name="copy"
                          className="text-[#AAABB5] w-3 h-3 desktop:w-[8px] desktop:h-[8px] group-hover:text-[#5a5b61] "
                        />
                      </div>
                    </div>
                  )}
                  {dataItem[settings.secondaryTitle] && (
                    <div
                      className={twMerge([
                        'flex',
                        'justify-between',
                        'flex-row',
                        'text-primary',
                        'gap-1',
                      ])}
                    >
                      <Tooltip
                        content={dataItem[settings.secondaryTitle]}
                        disabled={
                          dataItem[settings.secondaryTitle]?.length < 19 ||
                          !dataItem[settings.secondaryTitle]
                        }
                      >
                        <div
                          className="text-sm desktop:text-[10px] font-normal max-line-1 text-primary ml-2"
                          style={{
                            maxHeight: 45,
                            WebkitLineClamp: 3,
                          }}
                        >
                          {truncateString(
                            dataItem[settings.secondaryTitle],
                            114,
                          )}
                        </div>
                      </Tooltip>
                      <div
                        onClick={() => {
                          handleCopy(
                            dataItem[settings.secondaryTitle],
                            'secondary',
                          );
                        }}
                        className="group relative min-w-6 h-6 desktop:min-w-[18px] desktop:w-[18px] desktop:h-[18px] bg-[#FAFAFA] hover:bg-gray-100 flex items-center justify-center rounded-md cursor-pointer"
                      >
                        {copiedKey === 'secondary' && (
                          <div className="absolute -top-4 -right-2 bg-[#2B2C46] text-white text-[10px] py-0 px-1 rounded shadow pointer-events-none">
                            Copied!
                          </div>
                        )}
                        <Icon
                          name="copy"
                          className="text-[#AAABB5] w-3 h-3 desktop:w-[8px] desktop:h-[8px] group-hover:text-[#5a5b61] "
                        />
                      </div>
                    </div>
                  )}
                </div>
                {settings.attributes?.productAttributes &&
                  (settings.attributes?.attributeOneValue ||
                    settings.attributes?.attributeTwoValue ||
                    settings.attributes?.attributeThreeValue ||
                    settings.attributes?.attributeFourValue) && (
                    <div
                      className="attribute-container flex-grow content-end"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginBottom:
                          settings.CTAButton?.CTAButton ||
                          settings.secondaryCTAButton?.secondaryCTAButton
                            ? 8
                            : 0,
                        gridGap: 8,
                        color: '#3B3E5F',
                      }}
                    >
                      {settings.attributes?.attributeOneValue && (
                        <ProductAttribute
                          title={settings.attributes?.attributeOneLabelValue}
                          value={get(
                            dataItem,
                            settings.attributes?.attributeOneValue || '',
                          )}
                          padding={'4px 8px'}
                          isTitleVisible={
                            !!settings.attributes?.attributeOneLabelValue
                          }
                        />
                      )}
                      {settings.attributes?.attributeTwoValue && (
                        <ProductAttribute
                          title={settings.attributes?.attributeTwoLabelValue}
                          value={get(
                            dataItem,
                            settings.attributes?.attributeTwoValue || '',
                          )}
                          padding={'4px 8px'}
                          isTitleVisible={
                            !!settings.attributes?.attributeTwoLabelValue
                          }
                        />
                      )}
                      {settings.attributes?.attributeThreeValue && (
                        <ProductAttribute
                          title={settings.attributes?.attributeThreeLabelValue}
                          value={get(
                            dataItem,
                            settings.attributes?.attributeThreeValue || '',
                          )}
                          padding={'4px 8px'}
                          isTitleVisible={
                            !!settings.attributes?.attributeThreeLabelValue
                          }
                        />
                      )}

                      {settings.attributes?.attributeFourValue && (
                        <ProductAttribute
                          title={settings.attributes?.attributeFourLabelValue}
                          value={get(
                            dataItem,
                            settings.attributes?.attributeFourValue || '',
                          )}
                          padding={'4px 8px'}
                          isTitleVisible={
                            !!settings.attributes?.attributeFourLabelValue
                          }
                        />
                      )}
                    </div>
                  )}
              </div>
            </div>
            <div>
              {settings.secondaryCTAButton?.secondaryCTAButton && (
                <div
                  style={{
                    boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                    minHeight: 28,
                    background:
                      settings.secondaryCTAButton?.secondaryCTAButtonColor ||
                      '#2B2C46',
                    borderRadius: 6,
                    paddingLeft: '8px',
                    marginBottom: settings.CTAButton?.CTAButton ? 8 : 0,
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: 0,
                      cursor: settings.secondaryCTAButton.secondaryCTALinkField
                        ? 'pointer'
                        : 'normal',
                    }}
                    onClick={() => {
                      if (settings.secondaryCTAButton?.secondaryCTALinkField) {
                        // feedbackConversionEpic(state, indexItem, dataItem.sku);
                        window.open(
                          `${get(
                            dataItem,
                            settings.secondaryCTAButton?.secondaryCTALinkField,
                          )}`,
                          '_blank',
                        );
                      }
                    }}
                  >
                    <Tooltip
                      content={
                        settings.secondaryCTAButton?.secondaryCTAButtonText ||
                        ''
                      }
                    >
                      <div
                        className={`max-line-1 ${
                          settings.secondaryCTAButton.secondaryCTALinkField
                            ? 'desktop:136px'
                            : '164px'
                        }`}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          fontSize: '12px',
                          letterSpacing: '0.27px',
                          wordBreak: 'break-word',
                          color:
                            settings.secondaryCTAButton
                              .secondaryCTAButtonTextColor || '#FFFFFF',
                          paddingRight: '8px',
                        }}
                      >
                        {settings.secondaryCTAButton?.secondaryCTAButtonText}
                      </div>
                    </Tooltip>
                    {settings.secondaryCTAButton.secondaryCTAIcon && (
                      <div style={{ width: '16px' }}>
                        <Icon
                          name="settings"
                          fill={
                            settings.secondaryCTAButton
                              ?.secondaryCTAButtonTextColor || '#FFFFFF'
                          }
                          width={10}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {settings.CTAButton?.CTAButton && (
                <div
                  style={{
                    boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                    minHeight: 28,
                    background:
                      settings.CTAButton?.CTAButtonColor ||
                      settings.theme?.primaryColor,
                    borderRadius: 6,
                    paddingLeft: '8px',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: 0,
                      cursor: settings.CTAButton?.CTALinkField
                        ? 'pointer'
                        : 'normal',
                    }}
                    onClick={() => {
                      if (settings.CTAButton?.CTALinkField) {
                        // feedbackConversionEpic(state, indexItem, dataItem.sku);
                        window.open(
                          `${get(dataItem, settings.CTAButton?.CTALinkField)}`,
                          '_blank',
                        );
                      }
                    }}
                  >
                    <Tooltip
                      content={
                        get(
                          dataItem,
                          settings.CTAButton?.CTAButtonText || '',
                        ) ||
                        settings.CTAButton?.CTAButtonText ||
                        ''
                      }
                    >
                      <div
                        className={`max-line-1 ${
                          settings.CTAButton.CTALinkField
                            ? 'desktop:136px'
                            : '164px'
                        }`}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          color:
                            settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                          fontSize: '12px',
                          letterSpacing: '0.27px',
                          wordBreak: 'break-word',
                          paddingRight: '8px',
                        }}
                      >
                        {get(
                          dataItem,
                          settings.CTAButton?.CTAButtonText || '',
                        ) || settings.CTAButton?.CTAButtonText}
                      </div>
                    </Tooltip>
                    {settings.CTAButton?.CTAIcon && (
                      <div style={{ width: '16px' }}>
                        <Icon
                          name="link"
                          fill={
                            settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'
                          }
                          width={10}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {settings.cart && (
                <div
                  style={{
                    boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                    minHeight: 28,
                    background:
                      settings.CTAButton?.CTAButtonColor ||
                      settings.theme?.primaryColor,
                    borderRadius: 6,
                    paddingLeft: '8px',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onAddToCart(dataItem);
                    }}
                  >
                    <div
                      className={`max-line-1 ${'desktop:136px'}`}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        color:
                          settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                        fontSize: '12px',
                        letterSpacing: '0.27px',
                        wordBreak: 'break-word',
                        paddingRight: '8px',
                      }}
                    >
                      Add to cart
                    </div>
                    <div style={{ width: '16px' }}>
                      <Icon
                        name="plus"
                        fill={
                          settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'
                        }
                        className={twMerge('text-white')}
                        width={10}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(Product);
