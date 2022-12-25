import React from 'react';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import IconSupport from 'common/assets/icons/item_support_icon.svg';
import IconLike from 'common/assets/icons/icon_like.svg';
import IconDisLike from 'common/assets/icons/icon_dislike.svg';
import IconShare from 'common/assets/icons/Fill.svg';
import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import IconOpenLink from 'common/assets/icons/Union.svg';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useMediaQuery } from 'react-responsive';
import CloseIcon from '@material-ui/icons/Close';
import IconSearchImage from 'common/assets/icons/icon_search_image2.svg';
import {ImagePreviewCarousel} from "./carousel/ImagePreviewCarousel";

interface Props {
  numberResult?: number;
  results?: any;
  handlerCloseModal: () => void;
  onNextItem?: () => void;
  onPrevItem?: () => void;
  dataItem?: any;
  onHandlerModalShare?: () => void;
  onSearchImage?: any;
  moreInfoText?: string;
}

function DetailItem(props: Props) {
  const {
    handlerCloseModal,
    dataItem,
    onHandlerModalShare,
    onSearchImage,
    moreInfoText,
  } = props;
  const [collapDescription, setCollapDescription] = useState(false);
  const { title, sku, main_offer_link, brand } = dataItem;
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

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
    if (!dataItem) {
      return setDataImageCarouSel([]);
    }
    let valueKey: any[] = [];
    const newObject = dataItem;
    for (let key in newObject) {
      if (key?.includes('recognition_image_link')) {
        if (!isEmpty(newObject[key])) {
          valueKey.push({
            url: newObject[key],
          });
        }
      } else {
        if (key === 'main_image_link') {
          valueKey.push({
            url: newObject[key],
          });
        }
      }
    }
    setDataImageCarouSel(valueKey);
  };

  return (
    <Box className="box-modal-default" borderRadius={12}>
      {!isMobile ? (
        <Box
          className="ml-auto"
          style={{ width: 'fit-content', marginRight: 5 }}
        >
          <Button style={{ padding: 0 }} onClick={handlerCloseModal}>
            <CloseOutlinedIcon style={{ fontSize: 20, color: '#55566B' }} />
          </Button>
        </Box>
      ) : (
        <Box
          className="ml-auto"
          style={{ width: 'fit-content', marginLeft: 5 }}
        >
          <Button style={{ padding: 5 }} onClick={handlerCloseModal}>
            <CloseIcon style={{ fontSize: 25, color: '#55566B' }} />
          </Button>
        </Box>
      )}

      <Box className="box-carosel">
        <ImagePreviewCarousel
          imgItem={dataImageCarousel}
          onSearchImage={onSearchImage}
          handlerCloseModal={handlerCloseModal}
        />
        <Button
          className="icon-style"
          onClick={() => {
            if (urlImage.length > 1) {
              onSearchImage(urlImage);
              handlerCloseModal();
              return;
            }
          }}
        >
          <img src={IconSearchImage} alt="icon_picture" />
        </Button>
      </Box>

      <Box
        className="box-content"
        display={'flex'}
        style={{
          flexDirection: 'column',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          marginBottom: 19,
        }}
      >
        <Box className="box-top">
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Typography className="text-f10 fw-500 max-line-1">
                SKU: {sku}
              </Typography>
              <Box
                borderRadius={16}
                style={{
                  backgroundColor: '#E4E3FF',
                  width: 'fit-content',
                  padding: '3px 5px',
                  marginTop: 8,
                }}
              >
                <Typography
                  style={{ color: '#3E36DC', fontSize: 10, fontWeight: 700 }}
                >
                  {brand}
                </Typography>
              </Box>
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
              <Box className="w-100">
                <Button
                  className="w-100"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#3E36DC',
                    fontSize: 14,
                    textTransform: 'initial',
                    paddingLeft: 0,
                  }}
                  onClick={() => setCollapDescription(!collapDescription)}
                >
                  View full description
                  <KeyboardArrowDownIcon />
                </Button>
                <Collapse in={collapDescription}>
                  <Typography style={{ fontSize: 14 }}>
                    {dataItem?.keyword}
                  </Typography>
                </Collapse>
              </Box>
              <Box
                style={{
                  padding: '0px 16px',
                  marginBottom: 25,
                  background:
                    'linear-gradient(270deg, #56577C 0%, #2B2C46 100%)',
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
                    {moreInfoText ? moreInfoText : 'MORE INFO'}
                  </Typography>
                  <img src={IconOpenLink} alt="" style={{ width: 23 }} />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box className="box-bottom">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button className="btn-item">
                  <img
                    src={IconLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '30px' }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button className="btn-item">
                  <img
                    src={IconDisLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '30px' }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button className="btn-item" onClick={onHandlerModalShare}>
                  <img
                    src={IconShare}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '30px' }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
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
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default DetailItem;
