import { Box, Button, Grid, Typography } from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
import IconShare from 'common/assets/icons/Fill.svg';

import { ReactComponent as Expand } from 'common/assets/icons/expand.svg';
import { ReactComponent as IconDisLike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
// import IconWeChat from 'common/assets/icons/icon_chat.svg';
// import IconWhatsApp from 'common/assets/icons/icon_whatapps.svg';
import React, { memo, useEffect, useState } from 'react';
import NoImage from 'common/assets/images/unnamed.png';
import { AppState } from 'types';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import DetailItem from 'components/DetailItem';
import {
  onToggleModalItemDetail,
  setMobileDetailsPreview,
  updateStatusLoading,
} from 'Store/Search';
import { useVisualSearch } from 'hooks/useVisualSearch';
import { useMediaQuery } from 'react-responsive';
import { ShareModal } from '../ShareModal';

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
  setSelectedItem?: any;
}

function ItemResult(props: Props) {
  const {
    dataItem,
    isHover = false,
    onSearchImage,
    handlerGroupItem,
    handlerFeedback,
    isGroupItem,
    handlerCloseGroup,
    main_image_link,
    indexItem,
    setSelectedItem,
  } = props;
  const dispatch = useAppDispatch();
  const [urlImage, setUrlImage] = useState<string>('');
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [feedback, setFeedback] = useState('none');

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
    if (isMobile) {
      setSelectedItem(item);
      dispatch(setMobileDetailsPreview(true));
      document.getElementById('wrap-main-result')?.scrollIntoView();
      return;
    }
    dispatch(setMobileDetailsPreview(false));
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
      <DefaultModal
        openModal={isOpenModalImage && !isMobile}
        handleClose={(e: any) => {
          setOpenModalImage(false);
        }}
      >
        <DetailItem
          handlerCloseModal={() => {
            setOpenModalImage(false);
          }}
          handlerFeedback={handlerFeedback}
          dataItem={dataItem}
          onHandlerModalShare={() => setOpenModalShare(true)}
          onSearchImage={(url: string) => {
            dispatch(updateStatusLoading(true));
            getUrlToCanvasFile(url);
          }}
        />
      </DefaultModal>

      {/* TODO: Component modal share */}
      <ShareModal
        setModalState={setOpenModalShare}
        dataItem={dataItem}
        isOpen={isOpenModalShare}
      />
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
              onClick={() => handlerToggleModal(dataItem)}
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
              dispatch(setMobileDetailsPreview(false));
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
        <Box
          className="box-top"
          style={{ minHeight: settings.showMoreInfo ? '150px' : '90px' }}
        >
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Typography
                className="text-f10 max-line-1 fw-400 d-flex"
                style={{ color: '#2B2C46' }}
              >
                <Typography
                  className="text-f10 max-line-1 fw-400"
                  style={{ color: '#2B2C46', paddingRight: '4px' }}
                >
                  SKU:
                </Typography>
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
                    letterSpacing: '1px',
                  }}
                >
                  {brand || settings.brandName}
                </Typography>
              </Box>
              <Typography
                className="text-f12 fw-600 max-line-3"
                style={{ color: '#1E1F31' }}
              >
                {title}
              </Typography>
              {settings.showMoreInfo && (
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
                      {settings.productCtaText || 'MORE INFO'}
                    </Typography>
                    <img src={IconOpenLink} alt="" />
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {settings.showFeedbackAndShare && (
          <Box
            className="box-bottom"
            style={{ marginBottom: 6, marginTop: 10 }}
          >
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Box display={'flex'} alignItems={'center'}>
                  <Button
                    className="btn-item"
                    style={{ padding: '6px' }}
                    onClick={() => {
                      handlerFeedback('like');
                      setFeedback('like');
                    }}
                  >
                    <IconLike
                      width={16}
                      height={16}
                      color={feedback === 'like' ? '#3E36DC' : '#000000'}
                    />
                  </Button>
                </Box>
              </Grid>
              <Grid item>
                <Box display={'flex'} alignItems={'center'}>
                  <Button
                    style={{ padding: '6px' }}
                    className="btn-item"
                    onClick={() => {
                      handlerFeedback('dislike');
                      setFeedback('dislike');
                    }}
                  >
                    <IconDisLike
                      width={16}
                      height={16}
                      color={feedback === 'dislike' ? '#CC1854' : '#000000'}
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
        )}
      </Box>
    </Box>
  );
}

export default memo(ItemResult);
