import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
import IconShare from 'common/assets/icons/Fill.svg';
import IconDisLike from 'common/assets/icons/icon_dislike.svg';
import IconLike from 'common/assets/icons/icon_like.svg';
import { ReactComponent as Expand } from 'common/assets/icons/expand.svg';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import IconEmail from 'common/assets/icons/email_share.svg';
import IconWeChat from 'common/assets/icons/icon_chat.svg';
import IconWhatsApp from 'common/assets/icons/icon_whatapps.svg';
import React, { memo, useEffect, useState } from 'react';
import NoImage from 'common/assets/images/unnamed.png';
import { AppState } from 'types';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import DetailItem from 'components/DetailItem';
import { useMediaQuery } from 'react-responsive';
import { onToggleModalItemDetail, updateStatusLoading } from 'Store/Search';
import { useVisualSearch } from 'hooks/useVisualSearch';

interface Props {
  dataItem: any;
  handlerToggleModal?: any;
  handleClose?: () => void;
  isHover?: boolean;
  indexItem?: number;
  onSearchImage?: any;
  handlerFeedback?: any;
  handlerGroupItem?: any;
  isGroupItem?: boolean;
  moreInfoText?: string;
  handlerCloseGroup?: any;
  main_image_link?: any;
}

function ItemResult(props: Props) {
  const {
    dataItem,
    isHover = false,
    onSearchImage,
    handlerGroupItem,
    handlerFeedback,
    isGroupItem,
    moreInfoText,
    handlerCloseGroup,
    main_image_link,
    indexItem,
  } = props;
  const dispatch = useAppDispatch();
  const [urlImage, setUrlImage] = useState<string>('');
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);

  const { sku, title, brand, main_offer_link, collap } = dataItem;
  const { getUrlToCanvasFile } = useVisualSearch();
  useEffect(() => {
    if (main_image_link) {
      handlerCheckUrlImage(main_image_link);
    }
  }, [main_image_link]);

  const handlerShowGroup = () => {
    handlerGroupItem(dataItem, indexItem);
  };

  const handlerHideGroup = () => {
    handlerCloseGroup(dataItem, indexItem);
  };

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
    setOpenModalImage(true);
    dispatch(onToggleModalItemDetail(true));
    dispatch(updateStatusLoading(true));
    setTimeout(() => {
      dispatch(updateStatusLoading(false));
    }, 400);
  };

  return (
    <Box className="wrap-main-item-result">
      {/* TODO: Component modal image */}
      {!isMobile && (
        <DefaultModal
          openModal={isOpenModalImage}
          handleClose={(e: any) => {
            setOpenModalImage(false);
          }}
        >
          <DetailItem
            handlerCloseModal={() => {
              setOpenModalImage(false);
            }}
            dataItem={dataItem}
            onHandlerModalShare={() => setOpenModalShare(true)}
            onSearchImage={(url: string) => {
              dispatch(updateStatusLoading(true));
              getUrlToCanvasFile(url);
            }}
          />
        </DefaultModal>
      )}
      {/* TODO: Component modal share */}
      <DefaultModal
        openModal={isOpenModalShare}
        handleClose={() => setOpenModalShare(false)}
      >
        <Box
          className="box-modal-default box-modal-share"
          style={{ padding: '4px' }}
        >
          <Box
            className="ml-auto"
            style={{ width: 'fit-content', marginRight: 5 }}
          >
            <Button
              style={{ padding: 0 }}
              onClick={() => setOpenModalShare(false)}
            >
              <CloseOutlinedIcon style={{ fontSize: 16, color: '#55566B' }} />
            </Button>
          </Box>
          <Box className="box-content-box-share">
            <Typography
              className="text-f12 text-gray text-bold"
              style={{ marginBottom: '5px' }}
            >
              Share
            </Typography>
            <Paper component="form" className="box-input">
              <Box
                className="text-f9 text-gray"
                style={{
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '10px',
                }}
              >
                {dataItem.main_image_link}
              </Box>
              <IconButton
                color="secondary"
                aria-label="directions"
                style={{ padding: '4px' }}
                onClick={() => {
                  navigator.clipboard.writeText(dataItem.main_image_link);
                }}
              >
                <FileCopyOutlinedIcon style={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
            <Paper
              component="form"
              className="box-input"
              style={{ marginTop: '12px', marginBottom: '8px' }}
            >
              <Box
                className="text-f9 text-gray"
                style={{
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '10px',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>SKU</span> {dataItem.sku}
              </Box>
              <IconButton
                color="secondary"
                aria-label="directions"
                style={{ padding: '4px' }}
                onClick={() => {
                  navigator.clipboard.writeText(dataItem.sku);
                }}
              >
                <FileCopyOutlinedIcon style={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
            <Box
              className="box-media-share"
              display={'flex'}
              style={{ marginTop: '18px' }}
            >
              <a
                style={{ padding: 0 }}
                href={`mailto:support@nyris.io?subject=subject&body= ${encodeURIComponent(
                  'SKU: ' +
                    dataItem.sku +
                    '\r\n' +
                    'Image Link: ' +
                    dataItem.main_image_link,
                )} `}
              >
                <Box display={'flex'} alignItems={'center'}>
                  <img
                    width={40}
                    height={40}
                    src={IconEmail}
                    alt="icon_email"
                  />
                </Box>
              </a>
              <Button style={{ padding: 0, margin: '0 20px' }}>
                <Box display={'flex'} alignItems={'center'}>
                  <img
                    src={IconWeChat}
                    width={40}
                    height={40}
                    alt="icon_email"
                  />
                </Box>
              </Button>
              <Button style={{ padding: 0 }}>
                <Box display={'flex'} alignItems={'center'}>
                  <img
                    src={IconWhatsApp}
                    width={40}
                    height={40}
                    alt="icon_email"
                  />
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </DefaultModal>
      <Box className="box-top">
        {isGroupItem && collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerShowGroup}>
              Show group
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </Box>
        )}
        {isGroupItem && !collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerHideGroup}>
              Close group
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </Box>
        )}
        {!isHover && urlImage?.length > 1 && (
          <Box className="box-icon-modal">
            <Button
              style={{ width: '100%', height: '100%', padding: 0, zIndex: 9 }}
              onClick={handlerToggleModal}
            >
              <Expand color={settings.themePage.searchSuite?.secondaryColor} />
            </Button>
          </Box>
        )}
        <Box className="box-image">
          <Button
            style={{ width: '100%', height: '100%' }}
            onClick={(e: any) => {
              e.preventDefault();
              if (urlImage.length > 1) {
                onSearchImage(dataItem?.main_image_link);
              }
            }}
          >
            {main_image_link ? (
              <img
                src={main_image_link}
                key={main_image_link}
                alt="image_item"
                className="img-style"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <img
                src={NoImage}
                alt="image_item"
                className="img-style"
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </Button>
          {isHover && (
            <Box className="box-hover">
              <Button>View item</Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        className="box-content"
        display={'flex'}
        style={{
          flexDirection: 'column',
          backgroundColor: '#F3F3F5',
        }}
      >
        <Box className="box-top" style={{ minHeight: '150px' }}>
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Typography
                className="text-f10 max-line-1 fw-400"
                style={{ color: '#2B2C46' }}
              >
                {sku}
              </Typography>
              <Box
                mt={1}
                mb={1}
                style={{
                  background: `${settings.themePage.searchSuite?.secondaryColor}26`,
                  borderRadius: '6px',
                  display: 'flex',
                  width: 'fit-content',
                  padding: '2px 5px',
                }}
              >
                <Typography
                  className="fw-700"
                  style={{
                    color: settings.themePage.searchSuite?.secondaryColor,
                    fontSize: 8,
                  }}
                >
                  {brand}
                </Typography>
              </Box>
              <Typography
                className="text-f12 fw-600 max-line-3"
                style={{ color: '#1E1F31' }}
              >
                {title}
              </Typography>
              <Box
                style={{
                  boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                  // marginBottom: 22,
                  height: 40,
                  background: `linear-gradient(270deg, ${settings.themePage.searchSuite?.primaryColor}cc 0%, ${settings.themePage.searchSuite?.primaryColor} 100%)`,
                  borderRadius: 4,
                  padding: '0 8px',
                }}
                display={'flex'}
                justifyItems={'center'}
                alignItems={'center'}
                justifyContent={'space-between'}
                mt={2}
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
                  <Typography
                    className="text-f12 fw-600 text-white"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {moreInfoText ? moreInfoText : 'MORE INFO'}
                  </Typography>
                  <img src={IconOpenLink} alt="" />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box className="box-bottom" style={{ marginBottom: 6, marginTop: 10 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button
                  className="btn-item"
                  style={{ padding: '6px' }}
                  onClick={() => handlerFeedback('like')}
                >
                  <img
                    src={IconLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '16px', height: '16px' }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button
                  style={{ padding: '6px' }}
                  className="btn-item"
                  onClick={() => handlerFeedback('dislike')}
                >
                  <img
                    src={IconDisLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '16px', height: '16px' }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={'flex'} alignItems={'center'}>
                <Button
                  style={{ padding: '6px' }}
                  className="btn-item"
                  onClick={() => setOpenModalShare(true)}
                >
                  <img
                    src={IconShare}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: '16px', height: '16px' }}
                  />
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
                      src={IconShare}
                      alt="image_item"
                      className="icon_support"
                      style={{ width: '1rem' }}
                    />
                  </Box>
                </Button>
              </Box>
            </Grid> */}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ItemResult);
