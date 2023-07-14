import { Box, Button, Grid, Tooltip, Typography } from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
import { ReactComponent as IconShare } from 'common/assets/icons/Fill.svg';
import { ReactComponent as IconDisLike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
import { ReactComponent as IconSearchImage } from 'common/assets/icons/icon_search_image2.svg';
import React, { memo, useEffect, useState } from 'react';
import NoImage from 'common/assets/images/unnamed.png';
import { AppState } from 'types';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import DetailItem from 'components/DetailItem';
import {
  onToggleModalItemDetail,
  updateStatusLoading,
} from 'Store/search/Search';
import { ShareModal } from '../ShareModal';
import { truncateString } from 'helpers/truncateString';
import { useTranslation } from 'react-i18next';

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
  const [feedback, setFeedback] = useState('none');
  const { t } = useTranslation();
  const { sku, collap } = dataItem;
  const brand = dataItem[settings.field.productTag];

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

      <ShareModal
        setModalState={setOpenModalShare}
        dataItem={dataItem}
        isOpen={isOpenModalShare}
      />
      <Box className="box-top">
        {isGroupItem && collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerShowGroup}>
              {t('Show group')}
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </Box>
        )}
        {isGroupItem && !collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerHideGroup}>
              {t('Close group')}
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </Box>
        )}
        {!isHover && main_image_link && (
          <Box className="box-icon-modal">
            <Button
              style={{ width: '100%', height: '100%', padding: 0, zIndex: 9 }}
              onClick={() => {
                if (urlImage.length > 1) {
                  onSearchImage(main_image_link);
                }
              }}
            >
              <IconSearchImage color={settings.theme?.secondaryColor} />
            </Button>
          </Box>
        )}
        <Box className="box-image">
          <Button
            style={{ width: '100%', height: '100%' }}
            onClick={(e: any) => {
              e.preventDefault();
              handlerToggleModal(dataItem);
            }}
          >
            {main_image_link ? (
              <img
                src={main_image_link}
                key={main_image_link}
                alt="image_item"
                className="img-style"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={NoImage}
                alt="image_item"
                className="img-style"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          flexGrow: 1,
        }}
      >
        <Box className="box-top" style={{ minHeight: '90px' }}>
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Tooltip
                title={sku}
                placement="top"
                arrow={true}
                disableHoverListener={sku?.length < 19 || !sku}
              >
                <Typography
                  className="text-f12 max-line-1 fw-400"
                  style={{
                    color: '#2B2C46',
                    marginTop: 12,
                    display: 'inline-block',
                  }}
                >
                  <span style={{ marginRight: 3 }}>
                    {settings.itemIdLabel || 'SKU'}:
                  </span>
                  {truncateString(sku, 16)}
                </Typography>
              </Tooltip>

              {settings.warehouseVariant && (
                <Box>
                  <Typography
                    className="text-f12 max-line-1 fw-400"
                    style={{
                      color: '#2B2C46',
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
                </Box>
              )}

              {(!!brand || !!settings.brandName) && (
                <Tooltip
                  title={brand}
                  placement="top"
                  arrow={true}
                  disableHoverListener={brand?.length < 22 || !brand}
                >
                  <Box
                    style={{
                      background: `${settings.theme?.secondaryColor}26`,
                      borderRadius: '6px',
                      display: 'flex',
                      width: 'fit-content',
                      padding: '2px 5px',
                      marginTop: 3,
                    }}
                  >
                    <Typography
                      className="fw-700"
                      style={{
                        color: settings.theme?.secondaryColor,
                        fontSize: 10,
                        letterSpacing: '1px',
                        maxWidth: '160px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {truncateString(brand, 22) || settings.brandName}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {!settings.warehouseVariant && (
                <Typography
                  className="text-f13 fw-600 max-line-3"
                  style={{ color: '#1E1F31', marginTop: 12 }}
                >
                  {dataItem[settings.field.productName]}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
        <div>
          {(settings.showMoreInfo || settings.warehouseVariant) && (
            <Tooltip
              title={dataItem[settings.field.productName]}
              placement="top"
              arrow={true}
              disableHoverListener={
                dataItem[settings.field.productName]?.length < 35 ||
                !settings.warehouseVariant
              }
            >
              <Box
                style={{
                  boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                  // marginBottom: 22,
                  height: 40,
                  background: `linear-gradient(270deg, ${settings.theme?.primaryColor}bb 0%, ${settings.theme?.primaryColor} 100%)`,
                  borderRadius: 4,
                  padding: '0px 8px',
                  marginTop: '12px',
                }}
                display={'flex'}
                justifyItems={'center'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Button
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 0,
                  }}
                  onClick={() =>
                    window.open(
                      `${dataItem[settings.field.ctaLinkField]}`,
                      '_blank',
                    )
                  }
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
                      maxWidth: '136px',
                      paddingRight: '8px',
                    }}
                    align="left"
                  >
                    {settings.warehouseVariant
                      ? truncateString(dataItem[settings.field.productName], 35)
                      : settings.productCtaText || 'MORE INFO'}
                  </Typography>
                  <img src={IconOpenLink} alt="more-info" width={20} />
                </Button>
              </Box>
            </Tooltip>
          )}
          {settings.warehouseVariant && (
            <Box
              display="flex"
              justifyContent={'space-between'}
              style={{ color: '#2B2C46', marginTop: '12px' }}
              gridGap={10}
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
                  <div style={{ fontSize: 10, fontWeight: 500 }}>
                    {dataItem[settings.field.warehouseNumber]}
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
                  <div style={{ fontSize: 10, fontWeight: 500 }}>
                    {dataItem[settings.field.warehouseShelfNumber]}
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
              style={{ marginBottom: 6, marginTop: 12 }}
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
                {settings.shareOption && (
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
                )}
              </Grid>
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default memo(ItemResult);
