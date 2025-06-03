import { useEffect, useState } from 'react';
import { get } from 'lodash';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import { ImagePreviewCarousel } from '../Carousel/ImagePreviewCarousel';
import { prepareImageList } from 'utils/prepareImageList';
import { truncateString } from 'utils/truncateString';
import CadenasWebViewer from '../Cadenas/CadenasWebViewer';

import NoImage from '../../common/assets/images/no-image.svg';

import ProductAttribute from './ProductAttribute';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import Tooltip from 'components/Tooltip/TooltipComponent';

interface Props {
  dataItem?: any;
  handleClose?: any;
  handlerFeedback?: any;
  onHandlerModalShare?: any;
  show3dView?: boolean;
  onSearchImage?: any;
}

function ProductDetailView(props: Props) {
  const { dataItem, handleClose, show3dView = false, onSearchImage } = props;
  const { sku } = dataItem;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = window;

  const [is3dView, setIs3dView] = useState(show3dView);
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const [urlImage, setUrlImage] = useState<string>('');
  const [status3dView, setStatus3dView] = useState<
    'loading' | 'loaded' | 'not-found' | undefined
  >();
  const { t } = useTranslation();

  const extraDetailPropertyLength = isMobile ? 15 : 30;
  const extraDetailValueLength = isMobile ? 35 : 60;

  useEffect(() => {
    if (dataItem) {
      checkDataItemResult(dataItem);
      handlerCheckUrlImage(
        dataItem['image(main_similarity)'] ||
          dataItem['main_image_link'] ||
          dataItem['image'],
      );
    }
  }, [dataItem]);

  const handlerCheckUrlImage = (url: any, timeout?: number) => {
    timeout = timeout || 5000;
    let timedOut = false,
      timer: any;
    let img = new Image();
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

  const checkDataItemResult = (dataItem: any) => {
    const valueKey = prepareImageList(dataItem);

    setDataImageCarouSel(valueKey);
  };

  return (
    <div>
      <div className="ml-auto absolute top-7 right-7 z-10">
        <button className="p-0" onClick={() => handleClose?.()}>
          <Icon name="close" className="w-5 h-5 fill-[#55566B]" />
        </button>
      </div>

      <div className="relative h-[368px] desktop:h-[456px]">
        {settings.cadenas?.cadenas3dWebView && (
          <CadenasWebViewer
            is3dView={is3dView}
            sku={sku}
            status3dView={status3dView}
            setStatus3dView={setStatus3dView}
          />
        )}
        <div
          className={`box-carosel ${
            dataImageCarousel.length === 0 ? 'flex justify-center' : ''
          } ${
            is3dView ? 'w-0 h-0 opacity-0 hidden' : 'w-full'
          } transition-opacity duration-300 pt-4`}
          style={{ height: is3dView ? '0px' : 'h-[368px] desktop:h-[60%]' }}
        >
          {dataImageCarousel.length > 0 && (
            <ImagePreviewCarousel
              imgItem={dataImageCarousel}
              setSelectedImage={url => {
                setUrlImage(url ? url : urlImage);
              }}
            />
          )}
          {dataImageCarousel.length > 0 && !settings.noSimilarSearch && (
            <button
              className={`absolute right-4 bg-[rgba(243,243,245,0.4)] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer ${
                isMobile ? 'bottom-6' : 'bottom-1'
              }`}
              onClick={() => {
                if (urlImage.length > 1) {
                  onSearchImage(urlImage);
                  handleClose?.();
                  return;
                }
              }}
            >
              <Icon name="search_image" color={'#AAABB5'} />
            </button>
          )}
          {dataImageCarousel.length === 0 && (
            <div className="w-100 h-100 flex items-center justify-center">
              <img src={NoImage} alt="image_item" className="w-36 h-36 p-2" />
            </div>
          )}
        </div>

        <div
          className={`absolute left-4 ${isMobile ? 'bottom-6' : 'bottom-2'}`}
        >
          {!is3dView &&
            status3dView !== 'not-found' &&
            settings.cadenas?.cadenas3dWebView && (
              <div
                className="bg-[#E9E9EC] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer"
                onClick={() => {
                  setIs3dView(true);
                }}
              >
                <Icon name="box3d" width={16} height={16} color={'black'} />
              </div>
            )}
          {is3dView && (
            <div
              className="bg-[#2B2C46] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer"
              onClick={() => {
                setIs3dView(false);
              }}
            >
              <Icon name="close" color={'#FFF'} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`overflow-y-auto max-h-[90svh] px-4 pb-4  ${
          settings.simpleCardView ? 'bg-[#FaFafa]' : 'bg-[#f3f3f5]'
        } mt-1`}
      >
        {settings.simpleCardView ? (
          <div className="info-container">
            <div className="info-sku">{dataItem.sku}</div>
            <div className="info-marking">{dataItem.Bezeichnung}</div>
            <div className="info-description">
              {settings.language === 'en'
                ? dataItem.VK_Text_Englisch
                : dataItem.VK_Text_Deutsch}
            </div>
          </div>
        ) : (
          <div className="box-content flex flex-col bg-[#F3F3F5] mt-4">
            <div className="box-top">
              <div className="bg-[#F3F3F5] flex flex-col justify-between">
                <div className="gap-1.5 flex flex-wrap w-full">
                  <div className="w-full">
                    {settings.mainTitle && (
                      <Tooltip content={dataItem[settings.mainTitle]}>
                        <p className="text-base font-bold max-line-1 text-[#2B2C46] font-source-sans-3 leading-[22.78px] ml-2 w-fit">
                          {truncateString(dataItem[settings.mainTitle], 45)}
                        </p>
                      </Tooltip>
                    )}
                    {settings.secondaryTitle && (
                      <Tooltip
                        content={dataItem[settings.secondaryTitle] || ''}
                      >
                        <p className="text-f14 max-line-1 fw-400 text-[#2B2C46] ml-2 text-base w-fit">
                          {truncateString(
                            dataItem[settings.secondaryTitle],
                            isMobile ? 45 : 70,
                          )}
                        </p>
                      </Tooltip>
                    )}
                  </div>
                  {settings.attributes?.productAttributes && (
                    <div className="attribute-container">
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

                <div className="bg-[#F3F3F5] ">
                  <div
                    className={`w-full flex flex-col desktop:flex-row gap-0 desktop:gap-1.5`}
                  >
                    {settings.secondaryCTAButton?.secondaryCTAButton && (
                      <div
                        className={`rounded mt-2 flex justify-between items-center h-8 desktop:h-12 max-w-full w-full btn-detail-item`}
                        style={{
                          background:
                            settings.secondaryCTAButton
                              ?.secondaryCTAButtonColor || '#2B2C46',
                        }}
                      >
                        <div
                          className="flex justify-between items-center w-full px-3 min-h-8 cursor-pointer"
                          onClick={() => {
                            if (
                              settings.secondaryCTAButton?.secondaryCTALinkField
                            ) {
                              window.open(
                                `${get(
                                  dataItem,
                                  settings.secondaryCTAButton
                                    ?.secondaryCTALinkField,
                                )}`,
                                '_blank',
                              );
                            }
                          }}
                        >
                          <Tooltip
                            content={
                              settings.secondaryCTAButton
                                ?.secondaryCTAButtonText || ''
                            }
                          >
                            <p
                              className="text-f16 fw-600 max-line-1 text-white pr-1.5"
                              style={{
                                color:
                                  settings.secondaryCTAButton
                                    ?.secondaryCTAButtonTextColor || '#FFFFFF',
                              }}
                            >
                              {
                                settings.secondaryCTAButton
                                  ?.secondaryCTAButtonText
                              }
                            </p>
                          </Tooltip>
                          {settings.secondaryCTAButton.secondaryCTAIcon && (
                            <Icon name="settings" color="white" />
                          )}
                        </div>
                      </div>
                    )}
                    {settings.CTAButton?.CTAButton && (
                      <div
                        className="bg-[#2B2C46] rounded mt-2 flex justify-between items-center h-8 desktop:h-12 w-full btn-detail-item"
                        style={{
                          background:
                            settings.CTAButton?.CTAButtonColor ||
                            settings.theme?.primaryColor,
                        }}
                      >
                        <div
                          className="flex justify-between items-center w-full px-3 min-h-8 cursor-pointer"
                          onClick={() => {
                            if (settings.CTAButton?.CTALinkField) {
                              window.open(
                                `${get(
                                  dataItem,
                                  settings.CTAButton?.CTALinkField,
                                )}`,
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
                            <p
                              className="text-f16 fw-600 max-line-1 text-white pr-1.5"
                              style={{
                                color:
                                  settings.CTAButton?.CTAButtonTextColor ||
                                  '#FFFFFF',
                              }}
                            >
                              {get(
                                dataItem,
                                settings.CTAButton?.CTAButtonText || '',
                              ) ||
                                settings.CTAButton?.CTAButtonText ||
                                ''}
                            </p>
                          </Tooltip>
                          {settings.CTAButton?.CTAIcon && (
                            <Icon
                              name="link"
                              fill={
                                settings.CTAButton?.CTAButtonTextColor ||
                                '#FFFFFF'
                              }
                              width={16}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {settings.productDetailsAttribute?.length && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="view-details">
                      <AccordionTrigger className="w-full button-hover bg-[#F3F3F5] text-[#2b2c46] flex justify-between mt-3 px-4 text-base normal-case">
                        {t('View details')}
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div
                          style={{
                            background: '#E9E9EC',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            padding: '6px 15px 10px',
                          }}
                        >
                          {settings.productDetailsAttribute.map(detail =>
                            get(dataItem, detail.value)?.length ? (
                              <div
                                style={{
                                  height: 14,
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              >
                                <Tooltip
                                  content={detail.propertyName}
                                  disabled={
                                    detail.propertyName.length <
                                    extraDetailPropertyLength
                                  }
                                >
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      marginRight: 8,
                                      height: 14,
                                    }}
                                  >
                                    {detail.propertyName.length <
                                    extraDetailPropertyLength
                                      ? detail.propertyName
                                      : detail.propertyName
                                          .substring(
                                            0,
                                            extraDetailPropertyLength,
                                          )
                                          .concat('...')}
                                  </span>
                                </Tooltip>
                                <Tooltip
                                  content={get(dataItem, detail.value)}
                                  disabled={
                                    get(dataItem, detail.value)?.length <=
                                    extraDetailValueLength
                                  }
                                >
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 400,
                                      height: 14,
                                    }}
                                  >
                                    {get(dataItem, detail.value).length <=
                                    extraDetailValueLength
                                      ? get(dataItem, detail.value)
                                      : get(dataItem, detail.value)
                                          .substring(0, extraDetailValueLength)
                                          .concat('...')}
                                  </div>
                                </Tooltip>
                              </div>
                            ) : (
                              ''
                            ),
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailView;
