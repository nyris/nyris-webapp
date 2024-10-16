import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import { ReactComponent as IconOpenLink } from 'common/assets/icons/Union.svg';
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
import { ReactComponent as IconSettings } from 'common/assets/icons/settings.svg';

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
  const { collap } = dataItem;
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
  };

  return (
    <div className="wrap-main-item-result">
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
      <div className="box-top">
        {isGroupItem && collap && (
          <div className="btn-show-result">
            <Button onClick={handlerShowGroup}>
              {t('Show group')}
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </div>
        )}
        {isGroupItem && !collap && (
          <div className="btn-show-result">
            <Button onClick={handlerHideGroup}>
              {t('Close group')}
              <ChevronRightOutlinedIcon style={{ fontSize: '10px' }} />
            </Button>
          </div>
        )}
        {!isHover && main_image_link && !settings.noSimilarSearch && (
          <div
            className="box-icon-modal"
            onClick={() => {
              if (urlImage.length > 1) {
                onSearchImage(main_image_link);
              }
            }}
          >
            <IconSearchImage width={16} height={16} color={'#AAABB5'} />
          </div>
        )}
        {settings.cadenas?.cadenas3dWebView && (
          <div
            className="box-icon-modal-3d"
            onClick={() => {
              setOpenDetailedView('3d');
            }}
          >
            <Box3dIcon width={16} height={16} color={'#AAABB5'} />
          </div>
        )}

        <div className="box-image">
          <div
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
          </div>
        </div>
      </div>
      {settings.simpleCardView ? (
        <div className="info-container">
          <div className="info-sku">{dataItem.sku}</div>
          <span className="info-marking">{dataItem.Bezeichnung}</span>
          <Tooltip
            title={
              settings.language === 'en'
                ? dataItem.VK_Text_Englisch
                : dataItem.VK_Text_Deutsch
            }
            placement="top"
            arrow={true}
            disableHoverListener={
              settings.language === 'en'
                ? dataItem.VK_Text_Englisch?.length < 76
                : dataItem.VK_Text_Deutsch?.length < 76
            }
          >
            <div className="info-description">
              {settings.language === 'en'
                ? dataItem.VK_Text_Englisch
                : dataItem.VK_Text_Deutsch}
            </div>
          </Tooltip>
        </div>
      ) : (
        <div
          className="box-content"
          style={{
            flexDirection: 'column',
            backgroundColor: '#F3F3F5',
            flexGrow: 1,
            zIndex: 10,
            display: 'flex',
            paddingTop: 8,
          }}
        >
          <div className="box-top" style={{ color: '#FFFFFF' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                color: settings.theme.mainTextColor || '#2B2C46',
              }}
            >
              <div
                style={{
                  maxHeight: '38px',
                  height: 'fit-content'
                }}
              >
                {dataItem[settings.mainTitle] && (
                  <Tooltip
                    title={dataItem[settings.mainTitle] || ''}
                    placement="top"
                    arrow={true}
                  >
                    <Typography
                      className="text-f12 max-line-1 fw-700"
                      style={{
                        color: settings.theme.mainTextColor || '#2B2C46',
                        marginBottom: 4,
                      }}
                    >
                      {truncateString(dataItem[settings.mainTitle], 45)}
                    </Typography>
                  </Tooltip>
                )}
                {dataItem[settings.secondaryTitle] && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      color: settings.theme.mainTextColor || '#2B2C46',
                    }}
                  >
                    <Tooltip
                      title={dataItem[settings.secondaryTitle]}
                      placement="top"
                      arrow={true}
                      disableHoverListener={dataItem[settings.secondaryTitle]?.length < 19 || !dataItem[settings.secondaryTitle]}
                    >
                      <Typography
                        className="text-f10 max-line-1 fw-400"
                        style={{
                          color: settings.theme.mainTextColor || '#2B2C46',
                          marginBottom: 8,
                        }}
                      >
                        {truncateString(
                          dataItem[settings.secondaryTitle],
                          !settings.warehouseVariant ? 29 : isMobile ? 17 : 40,
                        )}
                      </Typography>
                    </Tooltip>
                  </div>
                )}
              </div>
              {settings.attributes?.productAttributes && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginBottom: 8,
                    gridGap: 8,
                    color: settings.theme.mainTextColor || '#2B2C46',
                  }}
                >
                  {!!get(dataItem, settings.attributes?.attributeOneValue || '') && (
                    <ProductAttribute
                      title={settings.attributes?.attributeOneLabelValue}
                      value={get(dataItem, settings.attributes?.attributeOneValue || '')}
                      padding={settings.theme.brandFieldPadding || '4px 8px'}
                      width={'48%'}
                      maxWidth={'calc(50% - 4px)'}
                      backgroundColor={settings.theme.brandFieldBackground}
                      isTitleVisible={settings.attributes?.labelsAttributes}
                    />
                  )}
                  {!!get(dataItem, settings.attributes?.attributeTwoValue || '') && (
                    <ProductAttribute
                      title={settings.attributes?.attributeTwoLabelValue}
                      value={get(dataItem, settings.attributes?.attributeTwoValue || '')}
                      padding={settings.theme.brandFieldPadding || '4px 8px'}
                      width={'48%'}
                      maxWidth={'calc(50% - 4px)'}
                      backgroundColor={settings.theme.brandFieldBackground}
                      isTitleVisible={settings.attributes?.labelsAttributes}
                    />
                  )}
                  {!!get(dataItem, settings.attributes?.attributeThreeValue || '') && (
                    <ProductAttribute
                      title={settings.attributes?.attributeThreeLabelValue}
                      value={get(dataItem, settings.attributes?.attributeThreeValue || '')}
                      padding={settings.theme.brandFieldPadding || '4px 8px'}
                      width={'48%'}
                      maxWidth={'calc(50% - 4px)'}
                      backgroundColor={settings.theme.brandFieldBackground}
                      isTitleVisible={settings.attributes?.labelsAttributes}
                    />
                  )}
                  {!!get(dataItem, settings.attributes?.attributeFourValue || '') && (
                    <ProductAttribute
                      title={settings.attributes?.attributeFourLabelValue}
                      value={get(dataItem, settings.attributes?.attributeFourValue || '')}
                      padding={settings.theme.brandFieldPadding || '4px 8px'}
                      width={'48%'}
                      maxWidth={'calc(50% - 4px)'}
                      backgroundColor={settings.theme.brandFieldBackground}
                      isTitleVisible={settings.attributes?.labelsAttributes}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            {settings.secondaryCTAButton?.secondaryCTAButton && (
              <div
                style={{
                  boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                  minHeight: 28,
                  background:
                    settings.secondaryCTAButton?.secondaryCTAButtonColor || '#2B2C46',
                  borderRadius: 2,
                  padding: '0px 8px',
                  marginBottom: 8,
                  display: 'flex',
                  justifyItems: 'center',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: 0,
                    cursor: settings.secondaryCTAButton.secondaryCTALinkField ? 'pointer' : 'normal',
                  }}
                  onClick={() => {
                    if (settings.secondaryCTAButton?.secondaryCTALinkField) {
                      feedbackConversionEpic(state, indexItem, dataItem.sku);
                      window.open(`${settings.secondaryCTAButton?.secondaryCTALinkField}`, '_blank');
                    }
                  }}
                >
                  <Tooltip
                    title={settings.secondaryCTAButton?.secondaryCTAButtonText || ''}
                    placement="top"
                    arrow={true}
                  >
                    <Typography
                      className="max-line-2"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        fontSize: '12px',
                        letterSpacing: '0.27px',
                        wordBreak: 'break-all',
                        color: settings.secondaryCTAButton.secondaryCTAButtonTextColor || '#FFFFFF',
                        maxWidth:
                          !isMobile && settings.secondaryCTAButton.secondaryCTALinkField ? '136px' : '164x',
                        paddingRight: '8px',
                      }}
                      align="left"
                    >
                      {settings.secondaryCTAButton?.secondaryCTAButtonText}
                    </Typography>
                  </Tooltip>
                  {settings.secondaryCTAButton.secondaryCTAIcon && (
                    <div style={{ width: '16px' }}>
                      {!settings.secondaryCTAButton.secondaryCTAIconSource ? (
                        <IconSettings fill={settings.secondaryCTAButton?.secondaryCTAButtonTextColor || '#FFFFFF'} />
                      ) : (
                        <img
                          alt="secondary"
                          style={{
                            width: 16,
                            height: 16,
                            objectFit: 'cover',
                          }}
                          src={settings.secondaryCTAButton.secondaryCTAIconSource}
                        />
                      )}
                    </div>
                    )}
                </div>
              </div>
            )}
            {settings.CTAButton?.CTAButton && (
              <div
                style={{
                  boxShadow: '-2px 2px 4px rgba(170, 171, 181, 0.5)',
                  minHeight: 28,
                  background:
                    settings.CTAButton?.CTAButtonColor ||
                    settings.theme?.primaryColor,
                  borderRadius: 2,
                  padding: '0px 8px',
                  display: 'flex',
                  justifyItems: 'center',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: 0,
                    cursor: settings.CTAButton?.CTALinkField ? 'pointer' : 'normal',
                  }}
                  onClick={() => {
                    if (settings.CTAButton?.CTALinkField) {
                      feedbackConversionEpic(state, indexItem, dataItem.sku);
                      window.open(`${get(dataItem, settings.CTAButton?.CTALinkField)}`, '_blank');
                    }
                  }}
                >
                  <Tooltip
                    title={get(dataItem, settings.CTAButton?.CTAButtonText || '') || settings.CTAButton?.CTAButtonText || ''}
                    placement="top"
                    arrow={true}
                  >
                    <Typography
                      className="max-line-2"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        color: settings.CTAButton?.CTAButtonTextColor || '#FFFFFF',
                        fontSize: '12px',
                        letterSpacing: '0.27px',
                        wordBreak: 'break-all',
                        maxWidth: !isMobile && settings.CTAButton?.CTALinkField ? '136px' : '164x',
                        paddingRight: '8px',
                      }}
                      align="left"
                    >
                      {get(dataItem, settings.CTAButton?.CTAButtonText || '') || settings.CTAButton?.CTAButtonText || ''}
                    </Typography>
                  </Tooltip>
                  {settings.CTAButton?.CTAIcon && (
                    <div style={{ width: '16px' }}>
                      {!settings.CTAButton.CTAIconSource ? (
                        <IconOpenLink
                          fill={settings.CTAButton?.CTAButtonTextColor || '#FFFFFF'}
                          width={16}
                        />
                      ) : (
                        <img
                          alt="secondary"
                          style={{
                            width: 16,
                            height: 16,
                            objectFit: 'cover',
                          }}
                        src={settings.CTAButton.CTAIconSource}
                      />
                    )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {settings.showFeedbackAndShare && (
              <div
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
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
                    </div>
                  </Grid>
                  <Grid item>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
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
                    </div>
                  </Grid>
                  {settings.shareOption && (
                    <Grid item>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Button
                          className="btn-item"
                          onClick={() => setOpenModalShare(true)}
                        >
                          <IconShare width={16} height={16} color="#000000" />
                        </Button>
                      </div>
                    </Grid>
                  )}
                </Grid>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ItemResult);
