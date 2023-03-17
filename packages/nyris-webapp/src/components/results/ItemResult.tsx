import { Box, Button, Grid, Typography } from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
import { ReactComponent as IconShare } from 'common/assets/icons/Fill.svg';
import { ReactComponent as Expand } from 'common/assets/icons/expand.svg';
import { ReactComponent as IconDisLike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
import React, { memo, useEffect, useState } from 'react';
import NoImage from 'common/assets/images/unnamed.png';
import { AppState } from 'types';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import DetailItem from 'components/DetailItem';
import { onToggleModalItemDetail, updateStatusLoading } from 'Store/Search';
import { useMediaQuery } from 'react-responsive';
import { ShareModal } from '../ShareModal';
import { truncateString } from 'helpers/truncateString';

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
    handlerCloseGroup,
    main_image_link,
    indexItem,
  } = props;
  const dispatch = useAppDispatch();
  const [urlImage, setUrlImage] = useState<string>('');
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const [isOpenModalImage, setOpenModalImage] = useState<boolean>(false);
  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [feedback, setFeedback] = useState('none');

  const { sku, title, brand, main_offer_link, collap } = dataItem;
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
  console.log({ dataItem });

  return (
    <Box
      className="wrap-main-item-result"
      // style={{
      //   height: 'calc(100% - 25px)',
      //   backgroundColor: 'rgb(243, 243, 245)',
      // }}
    >
      {/* TODO: Component modal image */}
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
          handlerFeedback={handlerFeedback}
          dataItem={dataItem}
          onHandlerModalShare={() => setOpenModalShare(true)}
          onSearchImage={(url: string) => {
            dispatch(updateStatusLoading(true));
            onSearchImage(url);
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
                className="text-f12 max-line-1 fw-400"
                style={{
                  color: '#2B2C46',
                  marginTop: 10,
                  display: 'inline-block',
                }}
              >
                <span style={{ marginRight: 3 }}>SKU:</span> {sku}
              </Typography>

              {settings.warehouseVariant && (
                <Typography
                  className="text-f12 max-line-1 fw-400"
                  style={{
                    color: '#2B2C46',
                    marginTop: 10,
                    display: 'inline-block',
                  }}
                >
                  <span style={{ marginRight: 3 }}>
                    {dataItem.custom_id_key_3}:
                  </span>
                  <span
                    style={{
                      color: dataItem.custom_id_value_3 ? '#00C070' : '#c54545',
                      fontWeight: 600,
                    }}
                  >
                    {dataItem.custom_id_value_3 || 0}
                  </span>
                </Typography>
              )}

              {(!!brand || !!settings.brandName) && (
                <Box
                  mt={1}
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
                      fontSize: 10,
                      letterSpacing: '1px',
                      maxWidth: '160px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {brand || settings.brandName}
                  </Typography>
                </Box>
              )}
              {!settings.warehouseVariant && (
                <Typography
                  className="text-f13 fw-600 max-line-3"
                  style={{ color: '#1E1F31', marginTop: 15 }}
                >
                  {title}
                </Typography>
              )}

              {(settings.showMoreInfo || settings.warehouseVariant) && (
                <Box
                  style={{
                    boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                    // marginBottom: 22,
                    height: 40,
                    background: `linear-gradient(270deg, ${settings.themePage.searchSuite?.primaryColor}bb 0%, ${settings.themePage.searchSuite?.primaryColor} 100%)`,
                    borderRadius: isMobile ? 25 : 4,
                    padding: '0 12px',
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
                      className="text-white max-line-2"
                      style={{
                        textTransform: !settings.warehouseVariant
                          ? 'uppercase'
                          : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: !settings.warehouseVariant ? 700 : 500,
                        fontSize: !settings.warehouseVariant ? '12px' : '11px',
                        letterSpacing: '0.27px',
                        wordBreak: !settings.warehouseVariant
                          ? 'normal'
                          : 'break-all',
                      }}
                      align="left"
                    >
                      {settings.warehouseVariant
                        ? title
                        : settings.productCtaText || 'MORE INFO'}
                    </Typography>
                    <img src={IconOpenLink} alt="more-info" width={20} />
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
            style={{ color: '#2B2C46', marginTop: '12px' }}
            gridGap={10}
          >
            <Box
              style={{
                backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                padding: '5px 10px',
                borderRadius: 4,
                width: '100%',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 500 }}>
                {dataItem.custom_id_key_2}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dataItem.custom_id_value_2 || 'N/A'}
              </div>
            </Box>

            <Box
              style={{
                backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                padding: '5px 10px',
                borderRadius: 4,
                width: '100%',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 500 }}>
                {dataItem.custom_id_key_1}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dataItem.custom_id_value_1 || 'N/A'}
              </div>
            </Box>
          </Box>
        )}

        {settings.showFeedbackAndShare && !settings.warehouseVariant && (
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
                    onClick={() => false}
                  >
                    <IconShare width={16} height={16} color="#808080" />
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
