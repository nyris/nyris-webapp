import React, { useEffect, useState } from 'react';
import $ from 'jquery';
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
import NoImage from '../common/assets/images/unnamed.png';
import { ReactComponent as Box3dIcon } from 'common/assets/icons/3d.svg';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';
import { useTranslation } from 'react-i18next';
import ProductAttribute from './ProductAttribute';
import CadenasWebViewer from './CadenasWebViewer';

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
        padding: '16px',
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

      <div style={{ position: 'relative' }}>
        <CadenasWebViewer
          is3dView={is3dView}
          sku={sku}
          status3dView={status3dView}
          setStatus3dView={setStatus3dView}
        />

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
          }}
        >
          {dataImageCarousel.length > 0 ? (
            <ImagePreviewCarousel imgItem={dataImageCarousel} />
          ) : (
            <img
              src={NoImage}
              alt="image_item"
              className="img-style"
              style={{ width: '400px', height: '400px', padding: '8px' }}
            />
          )}
          {dataImageCarousel.length > 0 && (
            <Button
              style={{
                position: 'absolute',
                bottom: is3dView ? '16px' : '78px',
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
        </Box>

        <div
          style={{
            position: 'absolute',
            bottom: is3dView ? '20px' : '68px',
            left: '16px',
          }}
        >
          {!is3dView && status3dView !== 'not-found' && (
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

      <Box style={{ overflowY: 'auto', maxHeight: '90svh' }}>
        <Box
          className="box-content"
          display={'flex'}
          style={{
            marginTop: '16px',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box className="box-top">
            <Grid container justifyContent="space-between">
              <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                style={{ gap: 6 }}
                width={'100%'}
              >
                <ProductAttribute
                  title={settings.itemIdLabel || 'SKU'}
                  value={sku}
                  width={
                    settings.warehouseVariant
                      ? { xs: '49%', md: 'fit-content' }
                      : { xs: '100%', md: 'fit-content' }
                  }
                />
                {settings.warehouseVariant && (
                  <ProductAttribute
                    title={dataItem[settings.field.warehouseStock]}
                    value={dataItem[settings.field.warehouseStockValue] || 0}
                    width={{ xs: '49%', md: 'fit-content' }}
                  />
                )}
                {(brand || settings.brandName) && (
                  <ProductAttribute
                    title={'Brand'}
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
              </Box>

              <Grid item xs={12}>
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
                        style={{ minWidth: 23, marginLeft: 5 }}
                      />
                    )}
                  </Box>
                </Box>
                {dataItem[settings.field.productDetails] && (
                  <Box className="w-100">
                    <Button
                      className="w-100"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: settings.theme?.secondaryColor,
                        fontSize: 14,
                        textTransform: 'initial',
                        paddingLeft: 5,
                        marginTop: 12,
                      }}
                      onClick={() => setCollapDescription(e => !e)}
                    >
                      View details
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
                      <Typography style={{ fontSize: 14, paddingTop: 5 }}>
                        {dataItem[settings.field.productDetails]}
                      </Typography>
                    </Collapse>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          {settings.warehouseVariant && (
            <Box
              display="flex"
              justifyContent={'space-between'}
              style={{ color: '#2B2C46', marginTop: 12 }}
              gridGap={8}
            >
              {settings.field.warehouseNumber && (
                <ProductAttribute
                  title={dataItem[settings.field.warehouseNumber]}
                  value={dataItem[settings.field.warehouseNumberValue] || 'N/A'}
                  width={{ xs: '49%', md: 'fit-content' }}
                />
              )}
              {settings.field.warehouseShelfNumber && (
                <ProductAttribute
                  title={dataItem[settings.field.warehouseShelfNumber]}
                  value={
                    dataItem[settings.field.warehouseShelfNumberValue] || 'N/A'
                  }
                  width={{ xs: '49%', md: 'fit-content' }}
                />
              )}
            </Box>
          )}

          {settings.showFeedbackAndShare && (
            <Box
              className="box-bottom"
              style={{ marginBottom: 6, marginTop: 28 }}
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
                        width={30}
                        height={30}
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
                        width={30}
                        height={30}
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
                        <IconShare width={30} height={30} color="#000000" />
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
