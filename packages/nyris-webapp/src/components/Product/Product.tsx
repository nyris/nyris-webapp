import { memo, useEffect, useState } from 'react';
import { get } from 'lodash';

import { Icon } from '@nyris/nyris-react-components';

import ProductAttribute from './ProductAttribute';
import { truncateString } from 'utils/truncateString';

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

  const [openDetailedView, setOpenDetailedView] = useState<
    '3d' | 'image' | undefined
  >();

  useEffect(() => {
    if (main_image_link) {
      handlerCheckUrlImage(main_image_link);
    }
  }, [main_image_link]);

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

  return (
    <>
      <ProductDetailViewModal
        dataItem={dataItem}
        handlerFeedback={handlerFeedback}
        onSearchImage={onSearchImage}
        openDetailedView={openDetailedView}
        setOpenDetailedView={setOpenDetailedView}
        main_image_link={main_image_link}
      />
      <div className="wrap-main-item-result max-w-[190px] w-[180px] desktop:w-[190px] border border-solid border-[#E0E0E0] scroll-pt-5">
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
          <div className={`info-container-card ${settings.CTAButton?.CTAButton ? 'w-cta' : ''}`}>
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
                  padding: '0px 8px',
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
                        wordBreak: 'break-all',
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
              className="relative h-fit text-primary flex flex-col justify-between "
              style={{ color: '#FFFFFF' }}
            >
              <div>
                <div className="max-h-[38px] h-fit">
                  {dataItem[settings.mainTitle] && (
                    <Tooltip content={dataItem[settings.mainTitle] || ''}>
                      <div className="text-xs font-bold text-primary mb-1 ml-2 max-line-1 w-fit">
                        {truncateString(dataItem[settings.mainTitle], 45)}
                      </div>
                    </Tooltip>
                  )}
                  {dataItem[settings.secondaryTitle] && (
                    <div
                      className={twMerge([
                        'flex',
                        'justify-between',
                        'flex-row',
                        'text-primary',
                      ])}
                    >
                      <Tooltip
                        content={dataItem[settings.secondaryTitle]}
                        disabled={
                          dataItem[settings.secondaryTitle]?.length < 19 ||
                          !dataItem[settings.secondaryTitle]
                        }
                      >
                        <div className="text-[10px] font-normal max-line-1 text-primary mb-2 ml-2">
                          {truncateString(
                            dataItem[settings.secondaryTitle],
                            40,
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </div>
                {settings.attributes?.productAttributes &&
                  (settings.attributes?.attributeOneValue ||
                    settings.attributes?.attributeTwoValue ||
                    settings.attributes?.attributeThreeValue ||
                    settings.attributes?.attributeFourValue) && (
                    <div
                      className="attribute-container"
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
                        color: '#2B2C46',
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
                          backgroundColor={'#E0E0E0'}
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
                          backgroundColor={'#E0E0E0'}
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
                          backgroundColor={'#E0E0E0'}
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
                          backgroundColor={'#E0E0E0'}
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
                    borderRadius: 4,
                    padding: '0px 8px',
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
                          wordBreak: 'break-all',
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
                        <Icon name="settings" color="white" />
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
                    borderRadius: 4,
                    padding: '0px 8px',
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
                          wordBreak: 'break-all',
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
                          width={16}
                        />
                      </div>
                    )}
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
