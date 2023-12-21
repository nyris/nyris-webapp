import { Box, Button, Grid, Tooltip, Typography } from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import IconOpenLink from 'common/assets/icons/Union.svg';
import { ReactComponent as IconShare } from 'common/assets/icons/Fill.svg';
import { ReactComponent as IconDisLike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
import { ReactComponent as IconSearchImage } from 'common/assets/icons/icon_search_image2.svg';
import { ReactComponent as Box3dIcon } from 'common/assets/icons/3d.svg';

import React, { memo, useEffect, useState } from 'react';
import NoImage from 'common/assets/images/no-image.svg';
import { RootState, useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import {
  onToggleModalItemDetail,
  updateStatusLoading,
} from 'Store/search/Search';
import { ShareModal } from '../ShareModal';
import { truncateString } from 'helpers/truncateString';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { feedbackClickEpic, feedbackConversionEpic } from 'services/Feedback';
import ProductDetailView from 'components/ProductDetailView';
import ProductAttribute from '../ProductAttribute';
import { get } from 'lodash';

interface Props {
  dataItem: any;
  handlerToggleModal?: any;
  handleClose?: () => void;
  isHover?: boolean;
  indexItem: number;
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
  const state = useAppSelector<RootState>((state: any) => state);
  const { settings } = state;

  const [openDetailedView, setOpenDetailedView] = useState<
    '3d' | 'image' | undefined
  >();

  const [isOpenModalShare, setOpenModalShare] = useState<boolean>(false);
  const [feedback, setFeedback] = useState('none');
  const { t } = useTranslation();
  const { sku, collap } = dataItem;
  const brand = dataItem[settings.field.productTag];
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

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
    feedbackClickEpic(state, indexItem, item.sku);
    setOpenDetailedView('image');

    dispatch(onToggleModalItemDetail(true));
    dispatch(updateStatusLoading(true));
    setTimeout(() => {
      dispatch(updateStatusLoading(false));
    }, 400);
  };
  const ctaLink = get(
    dataItem,
    settings.field?.ctaLinkField ? settings.field?.ctaLinkField : 'links.main',
  );

  return (
    <Box className="wrap-main-item-result">
      <DefaultModal
        openModal={openDetailedView === '3d' || openDetailedView === 'image'}
        handleClose={(e: any) => {
          setOpenDetailedView(undefined);
        }}
      >
        <ProductDetailView
          dataItem={dataItem}
          handleClose={() => {
            setOpenDetailedView(undefined);
          }}
          handlerFeedback={handlerFeedback}
          show3dView={openDetailedView === '3d'}
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
          <Box
            className="box-icon-modal"
            onClick={() => {
              if (urlImage.length > 1) {
                onSearchImage(main_image_link);
              }
            }}
          >
            <IconSearchImage width={16} height={16} color={'#AAABB5'} />
          </Box>
        )}
        {settings.cadenas3dWebView && (
          <Box
            className="box-icon-modal-3d"
            onClick={() => {
              setOpenDetailedView('3d');
            }}
          >
            <Box3dIcon width={16} height={16} color={'#AAABB5'} />
          </Box>
        )}

        <Box className="box-image">
          <Box
            style={{
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
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
                className="img-style product-image"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={NoImage}
                alt="image_item"
                style={{ width: '70%', height: '50%' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box
        className="box-content"
        display={'flex'}
        style={{
          flexDirection: 'column',
          backgroundColor: '#F3F3F5',
          flexGrow: 1,
          zIndex: 100,
        }}
      >
        <Box className="box-top" style={{ color: '#FFFFFF' }}>
          <Box
            display="flex"
            justifyContent={'space-between'}
            flexDirection={'column'}
            style={{ color: '#2B2C46' }}
            gridGap={8}
          >
            <Box
              display="flex"
              justifyContent={'space-between'}
              flexDirection={'row'}
              style={{ color: '#2B2C46', marginTop: 12 }}
              gridGap={8}
            >
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
                  }}
                >
                  {truncateString(
                    sku,
                    !settings.warehouseVariant ? 29 : isMobile ? 17 : 20,
                  )}
                </Typography>
              </Tooltip>

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
            <Box
              display="flex"
              justifyContent={'space-between'}
              flexDirection={'row'}
              style={{ color: '#2B2C46' }}
              gridGap={8}
            >
              {(brand || settings.brandName) && (
                <ProductAttribute
                  title={t('Brand')}
                  value={brand || settings.brandName}
                  padding="4px 8px"
                  width={{ xs: '49%' }}
                />
              )}

              {dataItem[settings.field.manufacturerNumber] && (
                <ProductAttribute
                  title={t('Mfr. No.')}
                  value={dataItem[settings.field.manufacturerNumber]}
                  padding="4px 8px"
                  width={{ xs: '49%' }}
                />
              )}
            </Box>
          </Box>
        </Box>
        {settings.warehouseVariant && (
          <Box
            display="flex"
            justifyContent={'space-between'}
            style={{ color: '#2B2C46', marginTop: '8px' }}
            gridGap={10}
          >
            {settings.field.warehouseNumber && (
              <ProductAttribute
                title={dataItem[settings.field.warehouseNumber]}
                value={dataItem[settings.field.warehouseNumberValue] || 'N/A'}
                padding="4px 8px"
                width={{ xs: '49%' }}
              />
            )}

            {settings.field.warehouseShelfNumber && (
              <ProductAttribute
                title={dataItem[settings.field.warehouseShelfNumber]}
                value={
                  dataItem[settings.field.warehouseShelfNumberValue] || 'N/A'
                }
                padding="4px 8px"
                width={{ xs: '49%' }}
              />
            )}
          </Box>
        )}
        <div>
          <Tooltip
            title={dataItem[settings.field.productName]}
            placement="top"
            arrow={true}
            disableHoverListener={
              dataItem[settings.field.productName]?.length < 45
            }
          >
            <Box
              style={{
                boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                // marginBottom: 22,
                height: 40,
                background: settings.theme?.primaryColor,
                borderRadius: 4,
                padding: '0px 8px',
                marginTop: '8px',
              }}
              display={'flex'}
              justifyItems={'center'}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: 0,
                  cursor: ctaLink ? 'pointer' : 'normal',
                }}
                onClick={() => {
                  if (ctaLink) {
                    feedbackConversionEpic(state, indexItem, dataItem.sku);
                    window.open(`${ctaLink}`, '_blank');
                  }
                }}
              >
                <Typography
                  className="text-white max-line-2"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                    fontSize: '12px',
                    letterSpacing: '0.27px',
                    wordBreak: 'break-all',
                    maxWidth: !isMobile && ctaLink ? '136px' : '164x',
                    paddingRight: '8px',
                  }}
                  align="left"
                >
                  {truncateString(dataItem[settings.field.productName], 45)}
                </Typography>
                {!isMobile && ctaLink && (
                  <img src={IconOpenLink} alt="more-info" width={16} />
                )}
              </Box>
            </Box>
          </Tooltip>

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
                        className="btn-item"
                        onClick={() => setOpenModalShare(true)}
                      >
                        <IconShare width={16} height={16} color="#000000" />
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
