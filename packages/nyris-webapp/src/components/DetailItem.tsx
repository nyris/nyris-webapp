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
    onHandlerModalShare,
    handlerFeedback,
  } = props;
  const [collapDescription, setCollapDescription] = useState(false);
  const { title, sku, main_offer_link, brand } = dataItem;
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const [feedback, setFeedback] = useState('none');
  const [urlImage, setUrlImage] = useState<string>('');
  useEffect(() => {
    checkDataItemResult(dataItem);
    handlerCheckUrlImage(dataItem?.main_image_link);
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

  return (
    <Box
      className="box-modal-default"
      borderRadius={12}
      style={isMobile ? { margin: 0 } : {}}
    >
      {!isMobile && (
        <Box
          className="ml-auto"
          style={{ width: 'fit-content', marginRight: 5 }}
        >
          <Button style={{ padding: 0 }} onClick={() => handlerCloseModal?.()}>
            <CloseOutlinedIcon style={{ fontSize: 20, color: '#55566B' }} />
          </Button>
        </Box>
      )}

      <Box className="box-carosel">
        <ImagePreviewCarousel
          imgItem={dataImageCarousel}
          onSearchImage={onSearchImage}
          handlerCloseModal={() => handlerCloseModal?.()}
        />
        {!isMobile && (
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
            <IconSearchImage
              color={settings.themePage.searchSuite?.secondaryColor}
            />
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
          marginBottom: 19,
          backgroundColor: '#F3F3F5',
        }}
      >
        <Box className="box-top">
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Typography className="text-f13 fw-500 max-line-1">
                SKU: {sku}
              </Typography>
              {brand && (
                <Box
                  borderRadius={16}
                  style={{
                    backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                    width: 'fit-content',
                    padding: '3px 5px',
                    marginTop: 8,
                  }}
                >
                  <Typography
                    style={{
                      color: settings.themePage.searchSuite?.secondaryColor,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {brand}
                  </Typography>
                </Box>
              )}
              <Typography
                className={
                  isMobile ? 'fw-600 text-dark' : 'text-f22 fw-600 text-dark'
                }
                style={{ margin: '8px 0px 0 0px' }}
              >
                {title}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {dataItem?.keyword && (
                <Box className="w-100">
                  <Button
                    className="w-100"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: settings.themePage.searchSuite?.secondaryColor,
                      fontSize: 14,
                      textTransform: 'initial',
                      paddingLeft: 0,
                    }}
                    onClick={() => setCollapDescription(!collapDescription)}
                  >
                    view details
                    <KeyboardArrowDownIcon
                      htmlColor={settings.themePage.searchSuite?.secondaryColor}
                    />
                  </Button>
                  <Collapse in={collapDescription}>
                    <Typography style={{ fontSize: 14 }}>
                      {dataItem?.keyword}
                    </Typography>
                  </Collapse>
                </Box>
              )}
              {settings.showMoreInfo && (
                <Box
                  style={{
                    padding: '0px 16px',
                    background: `linear-gradient(270deg, ${settings.themePage.searchSuite?.primaryColor}cc 0%, ${settings.themePage.searchSuite?.primaryColor} 100%)`,
                    // marginBottom: 25,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    borderRadius: 4,
                    height: 48,
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
                      padding: 0,
                    }}
                    onClick={() => window.open(`${main_offer_link}`, '_blank')}
                  >
                    <Typography className="text-f18 fw-600 text-white">
                      {settings.productCtaText || 'MORE INFO'}
                    </Typography>
                    <img src={IconOpenLink} alt="" style={{ width: 23 }} />
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {settings.showFeedbackAndShare && (
          <Box
            className="box-bottom"
            style={{ marginBottom: 6, marginTop: 28 }}
          >
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Box display={'flex'} alignItems={'center'}>
                  <Button
                    className="btn-item btn-action-item"
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
                    className="btn-item btn-action-item"
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
              <Grid item>
                <Box display={'flex'} alignItems={'center'}>
                  <Button
                    className="btn-item btn-action-item"
                    onClick={onHandlerModalShare}
                  >
                    <IconShare width={30} height={30} />
                  </Button>
                </Box>
              </Grid>
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
  );
}

export default DetailItem;
