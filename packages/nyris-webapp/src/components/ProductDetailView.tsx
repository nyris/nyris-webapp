import React, { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, Grid, Typography } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { ReactComponent as IconOpenLink }  from 'common/assets/icons/Union.svg';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useMediaQuery } from 'react-responsive';
import { ImagePreviewCarousel } from './carousel/ImagePreviewCarousel';
import { ReactComponent as IconSearchImage } from 'common/assets/icons/icon_search_image2.svg';
import { ReactComponent as IconShare } from 'common/assets/icons/Fill.svg';
import { ReactComponent as IconDisLike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
import { AppState } from 'types';
import { useAppSelector } from 'Store/Store';
import { prepareImageList } from '../helpers/CommonHelper';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import NoImage from '../common/assets/images/no-image.svg';
import { ReactComponent as Box3dIcon } from 'common/assets/icons/3d.svg';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';
import { useTranslation } from 'react-i18next';
import ProductAttribute from './ProductAttribute';
import CadenasWebViewer from './CadenasWebViewer';
import { makeStyles } from '@material-ui/core/styles';
import { get, isUndefined } from 'lodash';
import { ReactComponent as IconSettings } from 'common/assets/icons/settings.svg';
import {truncateString} from "../helpers/truncateString";

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
    handlerFeedback,
    onHandlerModalShare,
    show3dView = false,
    onSearchImage,
  } = props;
  const { sku, title } = dataItem;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const brand = dataItem[settings.field.productTag];

  const [collapseDescription, setCollapseDescription] = useState(false);
  const [feedback, setFeedback] = useState('none');
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
              <IconSearchImage color={'#AAABB5'} />
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
                <Box3dIcon width={16} height={16} color={'#AAABB5'} />
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
              <CloseIcon width={16} height={16} color={'#FFF'} />
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
                      <Typography
                        className="text-f12 max-line-1 fw-700"
                        style={{
                          color: settings.theme.mainTextColor || '#2B2C46',
                          marginTop: 8,
                        }}
                      >
                        {truncateString(dataItem[settings.mainTitle], 45)}
                      </Typography>
                    )}
                    {settings.secondaryTitle && (
                      <Typography
                        className="text-f12 max-line-1 fw-400"
                        style={{
                          color: settings.theme.mainTextColor || '#2B2C46',
                        }}
                      >
                        {truncateString(
                          dataItem[settings.secondaryTitle],
                          45,
                        )}
                      </Typography>
                    )}
                  </div>
                  {settings.attributes?.productAttributes && (
                    <>
                      <ProductAttribute
                        title={settings.attributes?.attributeOneLabelValue}
                        value={get(dataItem, settings.attributes?.attributeOneValue || '') || 0}
                        padding={settings.theme.brandFieldPadding || '4px 8px'}
                        width={'48%'}
                        maxWidth={'calc(50% - 4px)'}
                        backgroundColor={settings.theme.brandFieldBackground}
                        isTitleVisible={settings.attributes?.labelsAttributes}
                      />
                      <ProductAttribute
                        title={settings.attributes?.attributeTwoLabelValue}
                        value={get(dataItem, settings.attributes?.attributeTwoValue || '')}
                        padding={settings.theme.brandFieldPadding || '4px 8px'}
                        width={'48%'}
                        maxWidth={'calc(50% - 4px)'}
                        backgroundColor={settings.theme.brandFieldBackground}
                        isTitleVisible={settings.attributes?.labelsAttributes}
                      />
                      <ProductAttribute
                        title={settings.attributes?.attributeThreeLabelValue}
                        value={get(dataItem, settings.attributes?.attributeThreeValue || '')}
                        padding={settings.theme.brandFieldPadding || '4px 8px'}
                        width={'48%'}
                        maxWidth={'calc(50% - 4px)'}
                        backgroundColor={settings.theme.brandFieldBackground}
                        isTitleVisible={settings.attributes?.labelsAttributes}
                      />
                      <ProductAttribute
                        title={settings.attributes?.attributeFourLabelValue}
                        value={get(dataItem, settings.attributes?.attributeFourValue || '')}
                        padding={settings.theme.brandFieldPadding || '4px 8px'}
                        width={'48%'}
                        maxWidth={'calc(50% - 4px)'}
                        backgroundColor={settings.theme.brandFieldBackground}
                        isTitleVisible={settings.attributes?.labelsAttributes}
                      />
                    </>
                  )}
                </div>
  
                <Grid
                  item
                  xs={12}
                  style={{
                    backgroundColor: '#F3F3F5',
                  }}
                >
                  {settings.secondaryCTAButton && (
                    <div
                      style={{
                        background: settings.secondaryCTAButton?.secondaryCTAButtonColor || '#2B2C46',
                        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                        borderRadius: 4,
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
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
                          minHeight: 64,
                          cursor: settings.secondaryCTAButton?.secondaryCTALinkField ? 'pointer' : 'normal',
                        }}
                        onClick={() => {
                          if (settings.secondaryCTAButton?.secondaryCTALinkField) {
                            window.open(`${settings.secondaryCTAButton?.secondaryCTALinkField}`, '_blank');
                          }
                        }}
                      >
                        <Typography
                          className="text-f18 fw-700 text-white max-line-2"
                          align="left"
                          style={{
                            letterSpacing: '0.55px',
                            maxWidth: '500px',
                            paddingRight: '4px',
                          }}
                        >
                          {settings.secondaryCTAButton?.secondaryCTAButtonText}
                        </Typography>
                        {settings.secondaryCTAButton.secondaryCTAIcon && (
                          <>
                            {!settings.secondaryCTAButton.secondaryCTAIconSource ? (
                              <IconSettings fill={settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'} />
                            ) : (
                              <img
                                alt="secondary"
                                style={{
                                  width: '16px',
                                  objectFit: 'contain',
                                }}
                                src={settings.secondaryCTAButton.secondaryCTAIconSource}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
  
                  <div
                    style={{
                      background: settings.CTAButton?.CTAButtonColor || settings.theme?.primaryColor,
                      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                      borderRadius: 4,
                      marginTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                        minHeight: 64,
                        cursor: settings.CTAButton?.CTALinkField ? 'pointer' : 'normal',
                      }}
                      onClick={() => {
                        if (settings.CTAButton?.CTALinkField) {
                          window.open(`${settings.CTAButton?.CTALinkField}`, '_blank');
                        }
                      }}
                    >
                      <Typography
                        className="text-f18 fw-700 max-line-2"
                        align="left"
                        style={{
                          color: settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                          letterSpacing: '0.55px',
                          maxWidth: '500px',
                          paddingRight: '4px',
                        }}
                      >
                        {settings.CTAButton?.CTAButtonText
                          ? settings.CTAButton?.CTAButtonText
                          : dataItem[settings.field.productName]}
                      </Typography>
                      {settings.CTAButton?.CTAIcon && (
                        <>
                      {!settings.CTAButton.CTAIconSource ? (
                        <IconOpenLink
                        fill={settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'}
                        width={16}
                      />
                      ) : (
                      <img
                        alt="secondary"
                        style={{
                          width: '16px',
                          objectFit: 'contain',
                        }}
                        src={settings.CTAButton.CTAIconSource}
                      />
                      )}
                    </>
                    )}
                    </div>
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
  
            {settings.showFeedbackAndShare && (
              <div
                className="box-bottom"
                style={{
                  height: '48px',
                  padding: '0px 16px 0px 16px',
                  marginBottom: 10,
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Grid
                  container
                  justifyContent={
                    settings.shareOption ? 'space-between' : 'space-around'
                  }
                  alignItems="center"
                >
                  <Grid item>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        className="btn-item"
                        onClick={() => {
                          handlerFeedback('like');
                          setFeedback('like');
                        }}
                      >
                        <IconLike
                          width={24}
                          height={24}
                          color={feedback === 'like' ? '#3E36DC' : '#000000'}
                        />
                      </Button>
                    </div>
                  </Grid>
                  <Grid item>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        className="btn-item"
                        onClick={() => {
                          handlerFeedback('dislike');
                          setFeedback('dislike');
                        }}
                      >
                        <IconDisLike
                          width={24}
                          height={24}
                          color={feedback === 'dislike' ? '#CC1854' : '#000000'}
                        />
                      </Button>
                    </div>
                  </Grid>
                  {settings.shareOption && (
                    <Grid item>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          className="btn-item"
                          onClick={() => onHandlerModalShare()}
                        >
                          <IconShare width={24} height={24} color="#000000" />
                        </Button>
                      </div>
                    </Grid>
                  )}
                  {/* <Grid item>
                <div display={'flex'} alignItems={'center'}>
                  <Button className="btn-item">
                    <div
                      className=""
                      display={'flex'}
                      justifyContent={'center'}
                      alignItems={'center'}
                    >
                      <img
                        src={IconSupport}
                        alt="image_item"
                        className="icon_support"
                        style={{ width: '30px' }}
                      />
                    </div>
                  </Button>
                </div>
              </Grid> */}
                </Grid>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailView;
