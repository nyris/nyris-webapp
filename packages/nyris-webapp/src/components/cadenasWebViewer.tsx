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
import { ReactComponent as DownloadIcon } from 'common/assets/icons/download.svg';

import { useTranslation } from 'react-i18next';

declare var psol: any;

const favoriteActions3d = [
  'actMeasureGrid',
  'actCut',
  'actAnimate',
  'actIsometric',
];

interface Props {
  dataItem?: any;
  handleClose?: any;
  handlerFeedback?: any;
  onHandlerModalShare?: any;
  show3dView?: boolean;
  onSearchImage?: any;
}

function CadenasWebViewer(props: Props) {
  const {
    dataItem,
    handleClose,
    handlerFeedback,
    onHandlerModalShare,
    show3dView,
    onSearchImage,
  } = props;
  const { sku } = dataItem;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const { t } = useTranslation();
  const brand = dataItem[settings.field.productTag];
  const ctaLink = dataItem[settings.field?.ctaLinkField];
  const [collapDescription, setCollapDescription] = useState(false);
  const [feedback, setFeedback] = useState('none');
  const [is3dView, setIs3dView] = useState(show3dView);
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const [urlImage, setUrlImage] = useState<string>('');
  const [mident, setMident] = useState('');
  const [status3dView, setStatus3dView] = useState<
    'loading' | 'loaded' | 'not-found' | undefined
  >();

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

  const checkDataItemResult = (dataItem: any) => {
    const valueKey = prepareImageList(dataItem);

    setDataImageCarouSel(valueKey);
  };

  useEffect(() => {
    // prepare 3d viewer settings.
    var webViewer3DSettings = {
      $container: $('#cnsWebViewer3d'),
      viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
      devicePixelRatio: window.devicePixelRatio,
      radialMenuActions: [],
      favoriteActions: favoriteActions3d,
      showProgressDialog: false,
      webglViewerSettings: {
        ColorTL: '#FAFAFA',
        ColorTR: '#FAFAFA',
        ColorML: '#FAFAFA',
        ColorMR: '#FAFAFA',
        ColorBL: '#FAFAFA',
        ColorBR: '#FAFAFA',
        showLogo: false,
        logoTexture: './img/logo.png',
        logoScaleFactor: 1.0,
        logoMixFactor: 0.5,
        material: {
          preset: 'pcloud',
          edit: false,
        },
        measureGrid: {
          colors: {
            dimensions: '#000000',
            outline: '#0000ff',
            grid: '#757575',
            unit: 'mm',
          },
        },
        helperOptions: {
          gridOn: false,
          axisOn: false,
        },
        shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
        enableEditableDimensions: true,
        showPartNameTooltip: false,
      },
    };

    // initialize 3d viewer
    var webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);
    setStatus3dView('loading');
    // run search and display result in 3D viewer.
    psol.core
      .ajaxGetOrPost({
        url: psol.core.getServiceBaseUrl() + '/service/reversemap',
        data: {
          catalog: 'ganter',
          part: sku,
          exact: '0',
        },
      })
      .then(function (reverseMapResult: { mident: string }) {
        var mident = reverseMapResult.mident || '';
        setMident(mident);
        // load geometry in 3d viewer.
        webviewer3d.show().then(function () {
          webviewer3d
            .loadByVarset(null, null, mident)
            .then(() => {
              setStatus3dView('loaded');
            })
            .catch((err: any) => {
              setStatus3dView('not-found');
              setIs3dView(false);
            });
        });
      });
  }, [sku]);

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
        {status3dView !== 'not-found' && (
          <div
            id="cnsWebViewer3d"
            style={{
              height: !is3dView ? '0px' : isMobile ? '368px' : '456px',
              width: !is3dView ? '0px' : '100%',
              opacity: !is3dView ? 0 : 1,
              transition: is3dView ? 'opacity 3s ease' : '', // You can adjust the duration and easing here
            }}
          ></div>
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
            transition: !is3dView ? 'opacity 3s ease' : '', // You can adjust the duration and easing here
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
            bottom: '36px',
            right: !isMobile ? '202px' : '85px',
          }}
        >
          {is3dView && status3dView === 'loaded' && (
            <Box
              style={{
                background: '#FFF',
                width: '32px',
                height: '32px',
                borderRadius: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow:
                  '0 2px 10px 0 rgba(0,0,0,.16), 0 2px 5px 0 rgba(0,0,0,.26)',
              }}
              onClick={() => {
                new psol.components.DownloadDialog({
                  mident: mident,
                }).show();
              }}
            >
              <DownloadIcon width={16} height={16} color={'#FFF'} />
            </Box>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: is3dView ? '36px' : '78px',
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
              <Grid item xs={12}>
                <Typography className="text-f13 fw-500 max-line-1">
                  {settings.itemIdLabel || 'SKU'}: <span> {sku}</span>
                </Typography>
                {dataItem[settings.field.manufacturerNumber] && (
                  <Typography
                    className="text-f13 fw-500 max-line-1"
                    style={{ marginTop: '12px' }}
                  >
                    {t('Manufacturer Number')}:{' '}
                    {dataItem[settings.field.manufacturerNumber]}
                  </Typography>
                )}
                {settings.warehouseVariant && (
                  <Typography
                    className="text-f13 max-line-1 fw-500"
                    style={{
                      marginTop: 12,
                      display: 'inline-block',
                    }}
                  >
                    <span style={{ marginRight: 3 }}>
                      {dataItem[settings.field.warehouseStock]}:
                    </span>
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
                {(brand || settings.brandName) && (
                  <Box
                    borderRadius={16}
                    style={{
                      backgroundColor: `${settings.theme?.secondaryColor}26`,
                      width: 'fit-content',
                      padding: '3px 5px',
                      marginTop: 12,
                    }}
                  >
                    <Typography
                      style={{
                        color: settings.theme?.secondaryColor,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {brand || settings.brandName}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box
                  style={{
                    background: `linear-gradient(270deg, ${settings.theme?.primaryColor}bb 0%, ${settings.theme?.primaryColor} 100%)`,
                    // marginBottom: 25,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    borderRadius: 4,
                    marginTop: 12,
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
                        maxWidth: '300px',
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
              gridGap={20}
            >
              {settings.field.warehouseNumber && (
                <Box
                  style={{
                    backgroundColor: `${settings.theme?.secondaryColor}26`,
                    padding: '5px 10px',
                    borderRadius: 4,
                    width: '100%',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 500 }}>
                    {dataItem[settings.field.warehouseNumber]}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>
                    {dataItem[settings.field.warehouseNumberValue] || 'N/A'}
                  </div>
                </Box>
              )}

              {settings.field.warehouseShelfNumber && (
                <Box
                  style={{
                    backgroundColor: `${settings.theme?.secondaryColor}26`,
                    padding: '5px 10px',
                    borderRadius: 4,
                    width: '100%',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 500 }}>
                    {dataItem[settings.field.warehouseShelfNumber]}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>
                    {dataItem[settings.field.warehouseShelfNumberValue] ||
                      'N/A'}
                  </div>
                </Box>
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

export default CadenasWebViewer;
