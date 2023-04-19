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
import NoImage from '../common/assets/images/unnamed.png';
import { useTranslation } from 'react-i18next';

interface Props {
  numberResult?: number;
  handlerCloseModal?: () => void;
  dataItem?: any;
  onHandlerModalShare?: () => void;
  onSearchImage?: any;
  moreInfoText?: string;
  handlerFeedback: any;
}

function DetailItem(props: Props) {
  const {
    handlerCloseModal,
    dataItem,
    onSearchImage,
    // onHandlerModalShare,
    handlerFeedback,
  } = props;
  const [collapDescription, setCollapDescription] = useState(false);
  const { title, sku, main_offer_link, product_link, brand } = dataItem;
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const [feedback, setFeedback] = useState('none');
  const [urlImage, setUrlImage] = useState<string>('');
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
  const { t } = useTranslation();

  return (
    <Box
      className="box-modal-default"
      borderRadius={12}
      style={isMobile ? { margin: 0 } : {}}
    >
      <Box className="ml-auto" style={{ width: 'fit-content', marginRight: 4 }}>
        <Button style={{ padding: 0 }} onClick={() => handlerCloseModal?.()}>
          <CloseOutlinedIcon style={{ fontSize: 20, color: '#55566B' }} />
        </Button>
      </Box>
      <Box style={{ overflowY: 'auto', maxHeight: '90svh' }}>
        <Box
          className="box-carosel"
          style={
            dataImageCarousel.length === 0
              ? { display: 'flex', justifyContent: 'center' }
              : {}
          }
        >
          {dataImageCarousel.length > 0 ? (
            <ImagePreviewCarousel
              imgItem={dataImageCarousel}
              onSearchImage={onSearchImage}
              handlerCloseModal={() => handlerCloseModal?.()}
            />
          ) : (
            <img
              src={NoImage}
              alt="image_item"
              className="img-style"
              style={{ width: '300px', height: '300px', padding: '8px' }}
            />
          )}
          {!isMobile && dataImageCarousel.length > 0 && (
            <Button
              className="icon-style"
              onClick={() => {
                if (urlImage.length > 1) {
                  onSearchImage(urlImage);
                  handlerCloseModal?.();
                  return;
                }
              }}
            >
              <IconSearchImage color={settings.theme?.secondaryColor} />
            </Button>
          )}
        </Box>

        <Box
          className="box-content"
          display={'flex'}
          style={{
            flexDirection: 'column',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            paddingBottom: 19,
            backgroundColor: '#F3F3F5',
          }}
        >
          <Box className="box-top">
            <Grid container justifyContent="space-between">
              <Grid item xs={12}>
                <Typography className="text-f13 fw-500 max-line-1">
                  {settings.itemIdLabel || 'SKU'}: {sku}
                </Typography>
                {dataItem.keyword_1 && (
                  <Typography
                    className="text-f13 fw-500 max-line-1"
                    style={{ marginTop: '8px' }}
                  >
                    {t('Manufacturer Number')}: {dataItem.keyword_1}
                  </Typography>
                )}
                {settings.warehouseVariant && (
                  <Typography
                    className="text-f13 max-line-1 fw-500"
                    style={{
                      marginTop: 10,
                      display: 'inline-block',
                    }}
                  >
                    <span style={{ marginRight: 3 }}>
                      {dataItem.custom_id_key_3}:
                    </span>
                    <span
                      style={{
                        color: dataItem.custom_id_value_3
                          ? '#00C070'
                          : '#c54545',
                        fontWeight: 600,
                      }}
                    >
                      {dataItem.custom_id_value_3 || 0}
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
                      marginTop: 8,
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
                {!settings.warehouseVariant && (
                  <Typography
                    className={
                      isMobile
                        ? 'fw-600 text-dark'
                        : 'text-f22 fw-600 text-dark'
                    }
                    style={{
                      margin: '8px 0px 0 0px',
                      display: 'inline-block',
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                {dataItem?.keyword && (
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
                        marginTop: 5,
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
                        {dataItem?.keyword}
                      </Typography>
                    </Collapse>
                  </Box>
                )}
                {(settings.showMoreInfo || settings.warehouseVariant) && (
                  <Box
                    style={{
                      background: `linear-gradient(270deg, ${settings.theme?.primaryColor}bb 0%, ${settings.theme?.primaryColor} 100%)`,
                      // marginBottom: 25,
                      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                      borderRadius: 4,
                    }}
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    mt={2}
                    className="btn-detail-item"
                  >
                    <Button
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0px 12px',
                        minHeight: !settings.warehouseVariant ? 48 : 64,
                      }}
                      onClick={() =>
                        window.open(
                          `${product_link || main_offer_link}`,
                          '_blank',
                        )
                      }
                    >
                      <Typography
                        className="text-f18 fw-700 text-white max-line-2"
                        align="left"
                        style={{
                          textTransform: !settings.warehouseVariant
                            ? 'uppercase'
                            : 'none',
                          letterSpacing: '0.55px',
                        }}
                      >
                        {settings.warehouseVariant
                          ? title
                          : settings.productCtaText || 'MORE INFO'}
                      </Typography>
                      <img
                        src={IconOpenLink}
                        alt=""
                        style={{ width: 23, marginLeft: 5 }}
                      />
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          {settings.warehouseVariant && (
            <Box
              display="flex"
              justifyContent={'space-between'}
              mt={2}
              style={{ color: '#2B2C46' }}
              gridGap={20}
            >
              <Box
                style={{
                  backgroundColor: `${settings.theme?.secondaryColor}26`,
                  padding: '5px 10px',
                  borderRadius: 4,
                  width: '100%',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {dataItem.custom_id_key_2}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  {dataItem.custom_id_value_2 || 'N/A'}
                </div>
              </Box>
              <Box
                style={{
                  backgroundColor: `${settings.theme?.secondaryColor}26`,
                  padding: '5px 10px',
                  borderRadius: 4,
                  width: '100%',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {dataItem.custom_id_key_1}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  {dataItem.custom_id_value_1 || 'N/A'}
                </div>
              </Box>
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
                      <Button className="btn-item" onClick={() => false}>
                        <IconShare width={30} height={30} color="gray" />
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

export default DetailItem;
