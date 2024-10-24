import React, { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, Grid, Typography, Tooltip } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Icon } from '@nyris/nyris-react-components';
import NoImage from '../common/assets/images/no-image.svg';
import { useMediaQuery } from 'react-responsive';
import { ImagePreviewCarousel } from './carousel/ImagePreviewCarousel';
import { AppState } from 'types';
import { useAppSelector } from 'Store/Store';
import { prepareImageList } from '../helpers/CommonHelper';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';
import ProductAttribute from './ProductAttribute';
import CadenasWebViewer from './CadenasWebViewer';
import { makeStyles } from '@material-ui/core/styles';
import { get } from 'lodash';
import { truncateString } from '../helpers/truncateString';

const useStyles = makeStyles(theme => ({
  buttonStyle3D: {
    bottom: is3dView => (is3dView ? '20px' : '68px'), // assuming 8px is one spacing,
    [theme.breakpoints.up('md')]: {
      bottom: is3dView => (is3dView ? '20px' : '10px'), // assuming 68px is 8.5 spacing
    },
  },
  buttonStyleImageSearch: {
    bottom: is3dView => (is3dView ? '20px' : '78px'),
    [theme.breakpoints.up('md')]: {
      bottom: is3dView => (is3dView ? '20px' : '4px'), // assuming 68px is 8.5 spacing
    },
  },
}));

interface Props {
  dataItem?: any;
  handleClose?: any;
  handlerFeedback?: any;
  onHandlerModalShare?: any;
  show3dView?: boolean;
  onSearchImage?: any;
}

function ProductDetailView(props: Props) {
  const {
    dataItem,
    handleClose,
    show3dView = false,
    onSearchImage,
  } = props;
  const { sku } = dataItem;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);

  const [collapseDescription, setCollapseDescription] = useState(false);
  const [is3dView, setIs3dView] = useState(show3dView);
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const [urlImage, setUrlImage] = useState<string>('');
  const [status3dView, setStatus3dView] = useState<
    'loading' | 'loaded' | 'not-found' | undefined
  >();
  const { t } = useTranslation();
  const classes = useStyles(props?.show3dView);

  useEffect(() => {
    if (dataItem) {
      checkDataItemResult(dataItem);
      handlerCheckUrlImage(
        dataItem['image(main_similarity)'] || dataItem['main_image_link'],
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
  const productDetails = useMemo(() => {
    const details = get(dataItem, settings.field.productDetails);
    try {
      return details.join(', ');
    } catch (e) {
      return details;
    }
  }, [dataItem, settings.field.productDetails]);

  return (
    <div
      className="box-modal-default"
      style={{
        margin: isMobile ? 0 : '',
        width: '600px',
        backgroundColor: '#fff',
        borderRadius: 12,
      }}
    >
      <div
        className="ml-auto"
        style={{
          width: 'fit-content',
          marginRight: 4,
          position: 'absolute',
          top: '28px',
          right: '28px',
          zIndex: 100,
        }}
      >
        <Button style={{ padding: 0 }} onClick={() => handleClose?.()}>
          <CloseOutlinedIcon style={{ fontSize: 24, color: '#55566B' }} />
        </Button>
      </div>

      <div
        style={{
          position: 'relative',
        }}
      >
        {settings.cadenas?.cadenas3dWebView && (
          <CadenasWebViewer
            is3dView={is3dView}
            sku={sku}
            status3dView={status3dView}
            setStatus3dView={setStatus3dView}
          />
        )}
        <div
          className="box-carosel"
          style={{
            ...(dataImageCarousel.length === 0
              ? { display: 'flex', justifyContent: 'center' }
              : {}),
            width: is3dView ? '0px' : '100%',
            height: is3dView ? '0px' : !isMobile ? '60%' : '368px',
            opacity: is3dView ? 0 : 1,
            transition: !is3dView ? 'opacity 3s ease' : '',
            paddingTop: !is3dView ? '16px' : '0px',
          }}
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
            <Button
              className={classes.buttonStyleImageSearch}
              style={{
                position: 'absolute',
                right: '16px',
                background: 'rgba(243, 243, 245, 0.4)',
                width: '32px',
                height: '32px',
                borderRadius: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                bottom: isMobile ? '25px' : '4px',
              }}
              onClick={() => {
                if (urlImage.length > 1) {
                  onSearchImage(urlImage);
                  handleClose?.();
                  return;
                }
              }}
            >
              <Icon name="search_image" color={'#AAABB5'} />
            </Button>
          )}
          {dataImageCarousel.length === 0 && (
            <div
              style={{
                width: '400px',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={NoImage}
                alt="image_item"
                className="img-style"
                style={{ width: '150px', height: '150px', padding: '8px' }}
              />
            </div>
          )}
        </div>

        <div
          className={classes.buttonStyle3D}
          style={{
            position: 'absolute',
            left: '16px',
            bottom: isMobile ? '25px' : '10px',
          }}
        >
          {!is3dView &&
            status3dView !== 'not-found' &&
            settings.cadenas?.cadenas3dWebView && (
              <div
                style={{
                  background: '#E9E9EC',
                  width: '32px',
                  height: '32px',
                  borderRadius: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setIs3dView(true);
                }}
              >
                <Icon name="box3d" width={16} height={16} color={'#AAABB5'} />
              </div>
            )}
          {is3dView && (
            <div
              style={{
                background: '#2B2C46',
                width: '32px',
                height: '32px',
                borderRadius: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
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
        style={{
          overflowY: 'auto',
          maxHeight: '90svh',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: settings.simpleCardView ? '#FaFafa' : '#F3F3F5',
          marginTop: '6px',
        }}
      >
        {settings.simpleCardView ? (
          <div className="info-container">
            <div className="info-sku">{dataItem.sku}</div>
            <div className="info-marking">{dataItem.Bezeichnung}</div>
            <div className="info-description">{settings.language === 'en' ? dataItem.VK_Text_Englisch : dataItem.VK_Text_Deutsch}</div>
          </div>
        ) : (
          <div
            className="box-content"
            style={{
              display: 'flex',
              marginTop: '16px',
              flexDirection: 'column',
              backgroundColor: '#F3F3F5',
            }}
          >
            <div className="box-top">
              <Grid
                container
                justifyContent="space-between"
                style={{ backgroundColor: '#F3F3F5' }}
              >
                <div
                  style={{
                    gap: 6,
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: '100%',
                  }}
                >
                  <div style={{ width: '100%' }}>
                    {settings.mainTitle && (
                      <Tooltip
                        title={dataItem[settings.mainTitle]}
                        placement="top"
                        arrow={true}
                      >
                        <Typography
                          className="text-f16 max-line-1 fw-700"
                          style={{
                            color: settings.theme.mainTextColor || '#2B2C46',
                            fontFamily: 'Source Sans 3',
                            fontSize: '16px',
                            lineHeight: '22.78px',
                            width: 'fit-content',
                            marginLeft: 8,
                          }}
                        >
                          {truncateString(dataItem[settings.mainTitle], 45)}
                        </Typography>
                      </Tooltip>
                    )}
                    {settings.secondaryTitle && (
                      <Tooltip
                        title={dataItem[settings.secondaryTitle] || ''}
                        placement="top"
                        arrow={true}
                      >
                        <Typography
                          className="text-f14 max-line-1 fw-400"
                          style={{
                            color: settings.theme.mainTextColor || '#2B2C46',
                            width: 'fit-content',
                            marginLeft: 8,
                            fontSize: 14,
                          }}
                        >
                          {truncateString(
                            dataItem[settings.secondaryTitle],
                            isMobile ? 45 : 70,
                          )}
                        </Typography>
                      </Tooltip>
                    )}
                  </div>
                  {settings.attributes?.productAttributes && (
                    <div className="attribute-container">
                      {!!get(dataItem, settings.attributes?.attributeOneValue || '') && (
                        <ProductAttribute
                          title={settings.attributes?.attributeOneLabelValue}
                          value={get(dataItem, settings.attributes?.attributeOneValue || '')}
                          padding={settings.theme.brandFieldPadding || '4px 8px'}
                          backgroundColor={settings.theme.brandFieldBackground}
                          isTitleVisible={settings.attributes?.labelsAttributes}
                        />
                      )}
                      {!!get(dataItem, settings.attributes?.attributeTwoValue || '') && (
                        <ProductAttribute
                          title={settings.attributes?.attributeTwoLabelValue}
                          value={get(dataItem, settings.attributes?.attributeTwoValue || '')}
                          padding={settings.theme.brandFieldPadding || '4px 8px'}
                          backgroundColor={settings.theme.brandFieldBackground}
                          isTitleVisible={settings.attributes?.labelsAttributes}
                        />
                      )}
                      {!!get(dataItem, settings.attributes?.attributeThreeValue || '') && (
                        <ProductAttribute
                          title={settings.attributes?.attributeThreeLabelValue}
                          value={get(dataItem, settings.attributes?.attributeThreeValue || '')}
                          padding={settings.theme.brandFieldPadding || '4px 8px'}
                          backgroundColor={settings.theme.brandFieldBackground}
                          isTitleVisible={settings.attributes?.labelsAttributes}
                        />
                      )}
                      {!!get(dataItem, settings.attributes?.attributeFourValue || '') && (
                        <ProductAttribute
                          title={settings.attributes?.attributeFourLabelValue}
                          value={get(dataItem, settings.attributes?.attributeFourValue || '')}
                          padding={settings.theme.brandFieldPadding || '4px 8px'}
                          backgroundColor={settings.theme.brandFieldBackground}
                          isTitleVisible={settings.attributes?.labelsAttributes}
                        />
                      )}
                    </div>
                  )}
                </div>

                <Grid
                  item
                  xs={12}
                  style={{
                    backgroundColor: '#F3F3F5',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 0 : '6px',
                    }}
                  >
                    {settings.secondaryCTAButton?.secondaryCTAButton && (
                      <div
                        style={{
                          background: settings.secondaryCTAButton?.secondaryCTAButtonColor || '#2B2C46',
                          borderRadius: 2,
                          marginTop: 8,
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          height: isMobile ? '34px' : '50px',
                          maxWidth: isMobile ? '100%' : 'calc(50% - 3px)',
                        }}
                        className="btn-detail-item"
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '0px 12px',
                            minHeight: 34,
                            cursor: settings.secondaryCTAButton?.secondaryCTALinkField ? 'pointer' : 'normal',
                          }}
                          onClick={() => {
                            if (settings.secondaryCTAButton?.secondaryCTALinkField) {
                              window.open(`${get(dataItem, settings.secondaryCTAButton?.secondaryCTALinkField)}`, '_blank');
                            }
                          }}
                        >
                          <Tooltip
                            title={settings.secondaryCTAButton?.secondaryCTAButtonText || ''}
                            placement="top"
                            arrow={true}
                          >
                            <Typography
                              className="text-f16 fw-600 max-line-1"
                              align="left"
                              style={{
                                letterSpacing: '0.55px',
                                maxWidth: '220px',
                                paddingRight: '4px',
                                color: settings.secondaryCTAButton.secondaryCTAButtonTextColor || '#FFFFFF',
                              }}
                            >
                              {settings.secondaryCTAButton?.secondaryCTAButtonText}
                            </Typography>
                          </Tooltip>
                          {settings.secondaryCTAButton.secondaryCTAIcon && (
                            <Icon name="settings" color="white" />
                          )}
                        </div>
                      </div>
                    )}
                    {settings.CTAButton?.CTAButton && (
                      <div
                        style={{
                          background: settings.CTAButton?.CTAButtonColor || settings.theme?.primaryColor,
                          borderRadius: 2,
                          marginTop: 8,
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          height: isMobile ? '34px' : '50px',
                          maxWidth: isMobile ? '100%' : 'calc(50% - 3px)',
                        }}
                        className="btn-detail-item"
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '0px 12px',
                            minHeight: 34,
                            cursor: settings.CTAButton?.CTALinkField ? 'pointer' : 'normal',
                          }}
                          onClick={() => {
                            if (settings.CTAButton?.CTALinkField) {
                              window.open(`${get(dataItem, settings.CTAButton?.CTALinkField)}`, '_blank');
                            }
                          }}
                        >
                          <Tooltip
                            title={get(dataItem, settings.CTAButton?.CTAButtonText || '') || settings.CTAButton?.CTAButtonText || ''}
                            placement="top"
                            arrow={true}
                          >
                            <Typography
                              className="text-f16 fw-600 max-line-1"
                              align="left"
                              style={{
                                color: settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                                letterSpacing: '0.55px',
                                maxWidth: '220px',
                                paddingRight: '4px',
                              }}
                            >
                              {get(dataItem, settings.CTAButton?.CTAButtonText || '') || settings.CTAButton?.CTAButtonText || ''}
                            </Typography>
                          </Tooltip>
                          {settings.CTAButton?.CTAIcon && (
                            <Icon
                              name="link"
                              fill={settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'}
                              width={16}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {productDetails && (
                    <div className="w-100">
                      <Button
                        className="w-100 button-hover"
                        style={{
                          backgroundColor: '#F3F3F5',
                          color: settings.theme.mainTextColor || '#2b2c46',
                          display: 'flex',
                          fontSize: 14,
                          justifyContent: 'space-between',
                          marginTop: 12,
                          paddingLeft: '15px',
                          paddingRight: '15px',
                          textTransform: 'initial',
                        }}
                        onClick={() => setCollapseDescription(e => !e)}
                      >
                        {t('View details')}
                        {collapseDescription ? (
                          <KeyboardArrowUpIcon
                            htmlColor={settings.theme?.secondaryColor}
                          />
                        ) : (
                          <KeyboardArrowDownIcon
                            htmlColor={settings.theme?.secondaryColor}
                          />
                        )}
                      </Button>
                      <Collapse in={collapseDescription}>
                        <Typography
                          style={{
                            fontSize: 14,
                            padding: 5,
                            paddingLeft: 15,
                            paddingRight: 15,
                            color: settings.theme.mainTextColor || '#2b2c46',
                          }}
                        >
                          {productDetails}
                        </Typography>
                      </Collapse>
                    </div>
                  )}
                </Grid>
              </Grid>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailView;
