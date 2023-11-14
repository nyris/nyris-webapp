import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
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
  const { sku } = dataItem;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const brand = dataItem[settings.field.productTag];
  const ctaLink = dataItem[settings.field?.ctaLinkField];
  const [collapDescription, setCollapDescription] = useState(false);
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

  return (
    <Box
      className="box-modal-default"
      borderRadius={12}
      style={{
        margin: isMobile ? 0 : '',
        width: '600px',
        backgroundColor: '#fff',
      }}
    >
      <Box
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
      </Box>

      <div
        style={{
          position: 'relative',
        }}
      >
        {settings.cadenas3dWebView && (
          <CadenasWebViewer
            is3dView={is3dView}
            sku={sku}
            status3dView={status3dView}
            setStatus3dView={setStatus3dView}
          />
        )}
        <Box
          className="box-carosel"
          style={{
            ...(dataImageCarousel.length === 0
              ? { display: 'flex', justifyContent: 'center' }
              : {}),
            width: is3dView ? '0px' : '100%',
            height: is3dView ? '0px' : !isMobile ? '60%' : '368px',
            opacity: is3dView ? 0 : 1,
            transition: !is3dView ? 'opacity 3s ease' : '',
            paddingTop: '16px',
          }}
        >
          {dataImageCarousel.length > 0 && (
            <ImagePreviewCarousel imgItem={dataImageCarousel} setSelectedImage={(url) => {
              setUrlImage(url ? url : urlImage);
            }} />
          )}
          {dataImageCarousel.length > 0 && (
            <Button
              className={classes.buttonStyleImageSearch}
              style={{
                position: 'absolute',
                right: '16px',
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
        </Box>

        <div
          className={classes.buttonStyle3D}
          style={{
            position: 'absolute',
            left: '16px',
          }}
        >
          {!is3dView &&
            status3dView !== 'not-found' &&
            settings.cadenas3dWebView && (
              <Box
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
              </Box>
            )}
          {is3dView && (
            <Box
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
            </Box>
          )}
        </div>
      </div>

      <Box
        style={{
          overflowY: 'auto',
          maxHeight: '90svh',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: '#F3F3F5',
          marginTop: '6px',
        }}
      >
        <Box
          className="box-content"
          display={'flex'}
          style={{
            marginTop: '16px',
            flexDirection: 'column',
            backgroundColor: '#F3F3F5',
          }}
        >
          <Box className="box-top">
            {settings.warehouseVariant && (
              <Box
                display="flex"
                justifyContent={'space-between'}
                flexDirection={'row'}
                style={{
                  color: '#2B2C46',
                  marginBottom: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
                gridGap={8}
              >
                <Typography
                  className="text-f12 max-line-1 fw-400"
                  style={{
                    color: '#2B2C46',
                  }}
                >
                  {sku}
                </Typography>

                {settings.warehouseVariant && (
                  <Typography
                    className="text-f12 max-line-1 fw-400"
                    style={{
                      color: '#2B2C46',
                    }}
                  >
                    <span
                      style={{
                        color: dataItem[settings.field.warehouseStockValue]
                          ? '#00C070'
                          : '#c54545',
                        fontWeight: 600,
                      }}
                    >
                      {dataItem[settings.field.warehouseStockValue] || 0}
                    </span>
                  </Typography>
                )}
              </Box>
            )}

            <Grid
              container
              justifyContent="space-between"
              style={{ backgroundColor: '#F3F3F5' }}
            >
              <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                style={{ gap: 6 }}
                width={'100%'}
              >
                {!settings.warehouseVariant && (
                  <ProductAttribute
                    title={settings.itemIdLabel || 'SKU'}
                    value={sku}
                    width={
                      settings.warehouseVariant
                        ? { xs: '49%', md: 'fit-content' }
                        : { xs: '100%', md: 'fit-content' }
                    }
                  />
                )}
                {(brand || settings.brandName) && (
                  <ProductAttribute
                    title={t('Brand')}
                    value={brand || settings.brandName}
                    width={
                      dataItem[settings.field.manufacturerNumber]
                        ? { xs: '49%', md: 'fit-content' }
                        : { xs: '100%', md: 'fit-content' }
                    }
                  />
                )}
                {dataItem[settings.field.manufacturerNumber] && (
                  <ProductAttribute
                    title={t('Manufacturer Number')}
                    value={dataItem[settings.field.manufacturerNumber]}
                    width={
                      brand || settings.brandName
                        ? { xs: '49%', md: 'fit-content' }
                        : { xs: '100%', md: 'fit-content' }
                    }
                  />
                )}
                {settings.warehouseVariant && (
                  <>
                    {settings.field.warehouseNumber && (
                      <ProductAttribute
                        title={dataItem[settings.field.warehouseNumber]}
                        value={
                          dataItem[settings.field.warehouseNumberValue] || 'N/A'
                        }
                        width={{ xs: '49%', md: 'fit-content' }}
                      />
                    )}
                    {settings.field.warehouseShelfNumber && (
                      <ProductAttribute
                        title={dataItem[settings.field.warehouseShelfNumber]}
                        value={
                          dataItem[settings.field.warehouseShelfNumberValue] ||
                          'N/A'
                        }
                        width={{ xs: '49%', md: 'fit-content' }}
                      />
                    )}
                  </>
                )}
              </Box>

              <Grid
                item
                xs={12}
                style={{
                  backgroundColor: '#F3F3F5',
                }}
              >
                <Box
                  style={{
                    background: settings.theme?.primaryColor,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  className="btn-detail-item"
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0px 12px',
                      minHeight: 64,
                      cursor: ctaLink ? 'pointer' : 'normal',
                    }}
                    onClick={() => {
                      if (ctaLink) {
                        window.open(
                          `${dataItem[settings.field.ctaLinkField]}`,
                          '_blank',
                        );
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
                      {dataItem[settings.field.productName]}
                    </Typography>
                    {ctaLink && (
                      <img
                        src={IconOpenLink}
                        alt=""
                        style={{ minWidth: 16, marginLeft: 5 }}
                      />
                    )}
                  </Box>
                </Box>
                {dataItem[settings.field.productDetails] && (
                  <Box className="w-100">
                    <Button
                      className="w-100 button-hover"
                      style={{
                        backgroundColor: '#F3F3F5',
                        color: '#2b2c46',
                        display: 'flex',
                        fontSize: 14,
                        justifyContent: 'space-between',
                        marginTop: 12,
                        paddingLeft: '15px',
                        paddingRight: '15px',
                        textTransform: 'initial',
                      }}
                      onClick={() => setCollapDescription(e => !e)}
                    >
                      {t('View details')}
                      {collapDescription ? (
                        <KeyboardArrowUpIcon
                          htmlColor={settings.theme?.secondaryColor}
                        />
                      ) : (
                        <KeyboardArrowDownIcon
                          htmlColor={settings.theme?.secondaryColor}
                        />
                      )}
                    </Button>
                    <Collapse in={collapDescription}>
                      <Typography
                        style={{
                          fontSize: 14,
                          padding: 5,
                          paddingLeft: 15,
                          paddingRight: 15,
                          color: '#2b2c46',
                        }}
                      >
                        {dataItem[settings.field.productDetails]}
                      </Typography>
                    </Collapse>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          {settings.showFeedbackAndShare && (
            <Box
              className="box-bottom"
              style={{
                height: '48px',
                padding: '0px 16px 0px 16px',
                marginBottom: 10,
                marginTop: 10,
              }}
              display={'flex'}
              justifyContent={'center'}
            >
              <Grid
                container
                justifyContent={
                  settings.shareOption ? 'space-between' : 'space-around'
                }
                alignItems="center"
              >
                <Grid item>
                  <Box display={'flex'} alignItems={'center'}>
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
                  </Box>
                </Grid>
                <Grid item>
                  <Box display={'flex'} alignItems={'center'}>
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
                  </Box>
                </Grid>
                {settings.shareOption && (
                  <Grid item>
                    <Box display={'flex'} alignItems={'center'}>
                      <Button
                        className="btn-item"
                        onClick={() => onHandlerModalShare()}
                      >
                        <IconShare width={24} height={24} color="#000000" />
                      </Button>
                    </Box>
                  </Grid>
                )}
                {/* <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button className="btn-item">
                  <Box
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
                  </Box>
                </Button>
              </Box>
            </Grid> */}
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ProductDetailView;
