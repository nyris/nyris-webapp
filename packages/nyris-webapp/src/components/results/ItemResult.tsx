import { Box, Button, Grid, Typography } from "@material-ui/core";
import React, { memo, useEffect, useState } from "react";
import IconSupport2 from "common/assets/icons/item_support_icon.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconShare from "common/assets/icons/Fill.svg";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import IconOpenLink from "common/assets/icons/Union.svg";
import IconSearchImage from "common/assets/icons/icon_search_image2.svg";
import NoImage from "common/assets/images/unnamed.png";
interface Props {
  dataItem: any;
  handlerToggleModal?: any;
  handleClose?: () => void;
  handlerToggleModalShare?: () => void;
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
    handlerToggleModal,
    handlerToggleModalShare,
    isHover = false,
    onSearchImage,
    handlerFeedback,
    handlerGroupItem,
    isGroupItem,
    moreInfoText,
    handlerCloseGroup,
    main_image_link,
    indexItem,
  } = props;
  const [urlImage, setUrlImage] = useState<string>("");
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
        setUrlImage("");
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
  
  return (
    <Box className="wrap-main-item-result">
      <Box className="box-top">
        {isGroupItem && collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerShowGroup}>
              Show group
              <ChevronRightOutlinedIcon style={{ fontSize: "10px" }} />
            </Button>
          </Box>
        )}
        {isGroupItem && !collap && (
          <Box className="btn-show-result">
            <Button onClick={handlerHideGroup}>
              Close group
              <ChevronRightOutlinedIcon style={{ fontSize: "10px" }} />
            </Button>
          </Box>
        )}
        {!isHover && urlImage?.length > 1 && (
          <Box className="box-icon-modal">
            <Button
              onClick={(e: any) => {
                e.preventDefault();
                if (urlImage.length > 1) {
                  onSearchImage(dataItem?.main_image_link);
                }
              }}
            >
              <img src={IconSearchImage} alt="" width={30} height={30} />
            </Button>
          </Box>
        )}
        <Box className="box-image">
          <Button
            style={{ width: "100%", height: "100%", padding: 0, zIndex: 9 }}
            onClick={handlerToggleModal}
          >
            {urlImage?.length > 1 ? (
              <img
                src={main_image_link}
                alt="image_item"
                className="img-style"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <img
                src={NoImage}
                alt="image_item"
                className="img-style"
                style={{ width: "100%", height: "100%" }}
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
        display={"flex"}
        style={{ flexDirection: "column", backgroundColor: "#F3F3F5" }}
      >
        <Box className="box-top">
          <Grid container justifyContent="space-between">
            <Grid item xs={12}>
              <Typography
                className="text-f10 max-line-1 fw-400"
                style={{ color: "#2B2C46" }}
              >
                {sku}
              </Typography>
              <Box
                mt={1}
                mb={1}
                style={{
                  background: "#E4E3FF",
                  borderRadius: "6px",
                  display: "flex",
                  width: "fit-content",
                  padding: "2px 5px",
                }}
              >
                <Typography
                  className="fw-700"
                  style={{ color: "#3E36DC", fontSize: 8 }}
                >
                  {brand}
                </Typography>
              </Box>
              <Typography
                className="text-f12 fw-600 max-line-3"
                style={{ color: "#1E1F31" }}
              >
                {title}
              </Typography>
              <Box
                style={{
                  boxShadow: "-2px 2px 4px rgba(170, 171, 181, 0.5)",
                  marginBottom: 22,
                  height: 40,
                  background:
                    "linear-gradient(270deg, #56577C 0%, #2B2C46 100%)",
                  borderRadius: 4,
                  padding: "0 8px",
                }}
                display={"flex"}
                justifyItems={"center"}
                alignItems={"center"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Button
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: 0,
                  }}
                  onClick={() => window.open(`${main_offer_link}`, "_blank")}
                >
                  <Typography
                    className="text-f12 fw-600 text-white"
                    style={{ textTransform: "uppercase" }}
                  >
                    {moreInfoText}
                  </Typography>
                  <img src={IconOpenLink} alt="" />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box className="box-bottom" style={{ marginBottom: 14 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Box display={"flex"} alignItems={"center"}>
                <Button
                  className="btn-item"
                  onClick={() => handlerFeedback("like")}
                >
                  <img
                    src={IconLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: "1rem" }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={"flex"} alignItems={"center"}>
                <Button
                  className="btn-item"
                  onClick={() => handlerFeedback("dislike")}
                >
                  <img
                    src={IconDisLike}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: "1rem" }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={"flex"} alignItems={"center"}>
                <Button className="btn-item" onClick={handlerToggleModalShare}>
                  <img
                    src={IconShare}
                    alt="image_item"
                    className="icon_action"
                    style={{ width: "1rem" }}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box display={"flex"} alignItems={"center"}>
                <Button className="btn-item">
                  <Box
                    className=""
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <img
                      src={IconSupport2}
                      alt="image_item"
                      className="icon_support"
                      style={{ width: "1rem" }}
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

export default memo(ItemResult);
