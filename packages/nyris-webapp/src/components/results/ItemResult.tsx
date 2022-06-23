import { Box, Button, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import IconSupport2 from "common/assets/icons/item_support_icon.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconShare from "common/assets/icons/Fill.svg";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import IconOpenLink from "common/assets/icons/Union.svg";
import IconSearchImage from "common/assets/icons/icon_search_image.svg";
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
  } = props;

  const { sku, title, main_image_link, brand, main_offer_link } = dataItem;
  const [showGroup, setShowGroup] = useState<boolean>(false);

  const handlerShowGroup = () => {
    handlerGroupItem();
    setShowGroup(true);
  };

  const handlerHideGroup = () => {
    handlerCloseGroup();
    setShowGroup(false);
  };

  return (
    <Box
      className="wrap-main-item-result"
      style={{ filter: "drop-shadow(0px 0px 6px rgba(170, 171, 181, 0.7))" }}
    >
      <Box className="box-top">
        {isGroupItem && !showGroup && (
          <Box className="btn-show-result">
            <Button onClick={handlerShowGroup}>
              Show group{" "}
              <ChevronRightOutlinedIcon style={{ fontSize: "10px" }} />
            </Button>
          </Box>
        )}
        {isGroupItem && showGroup && (
          <Box className="btn-show-result">
            <Button onClick={handlerHideGroup}>
              Close group{" "}
              <ChevronRightOutlinedIcon style={{ fontSize: "10px" }} />
            </Button>
          </Box>
        )}
        {!isHover && (
          <Box className="box-icon-modal">
            <Button
              onClick={(e: any) => {
                e.preventDefault();
                onSearchImage(main_image_link);
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
            <img
              src={dataItem?.img?.url ? dataItem?.img?.url : main_image_link}
              alt="image_item"
              className="img-style"
              style={{ width: "100%", height: "100%" }}
            />
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
                  padding: "5px 10px",
                  backgroundColor: "#55566B",
                  boxShadow: "-2px 2px 4px rgba(170, 171, 181, 0.5)",
                  borderRadius: 1,
                  marginBottom: 22,
                }}
                display={"flex"}
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

export default ItemResult;
