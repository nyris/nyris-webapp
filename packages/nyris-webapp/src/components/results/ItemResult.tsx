import { Box, Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import IconSupport from "common/assets/icons/support.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconShare from "common/assets/icons/Fill.svg";
import IconBookmark from "common/assets/icons/book_mark.svg";
import IconModalImage from "common/assets/icons/icon_modal_image.svg";

interface Props {
  dataItem: any;
  handlerToggleModal?: any;
  handleClose?: () => void;
  handlerToggleModalShare?: () => void;
  isHover?: boolean;
  indexItem?: number;
  onSearchImage?: any;
  handlerFeedback?: any;
}

function ItemResult(props: Props) {
  const {
    dataItem,
    handlerToggleModal,
    handlerToggleModalShare,
    isHover = false,
    onSearchImage,
    handlerFeedback,
  } = props;
  const { img, sku, title, main_image_link } = dataItem;

  return (
    <Box className="wrap-main-item-result">
      <Box className="box-top">
        {!isHover && (
          <Box className="box-icon-modal">
            <Button
              onClick={(e: any) => {
                e.preventDefault();
                onSearchImage(main_image_link);
                // handlerToggleModal();
              }}
            >
              <img
                src={IconModalImage}
                alt="icon_modal"
                width={21}
                height={21}
              />
            </Button>
          </Box>
        )}

        <Box className="box-image">
          <Button
            style={{ width: "100%", height: "100%", padding: 0, zIndex: 9 }}
            onClick={handlerToggleModal}
          >
            <img
              src={img?.url ? img?.url : main_image_link}
              alt="image_item"
              className="img-style"
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
        style={{ flexDirection: "column" }}
      >
        <Box className="box-top">
          <Grid container justifyContent="space-between">
            <Grid item xs={10}>
              <Typography className="text-f8 max-line-1">SKU: {sku}</Typography>
              <Typography className="text-f9 text-bold max-line-3">
                {title}
              </Typography>
            </Grid>
            <Grid item>
              <Button className="btn-item">
                <img
                  src={IconBookmark}
                  alt="image_item"
                  className="icon_action"
                />
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box className="box-bottom">
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
                  />
                </Button>
                <Button
                  className="btn-item"
                  onClick={() => handlerFeedback("dislike")}
                >
                  <img
                    src={IconDisLike}
                    alt="image_item"
                    className="icon_action"
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
                  />
                </Button>
                <Button className="btn-item">
                  <Box
                    className="box-gray text-center box-support"
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <img
                      src={IconSupport}
                      alt="image_item"
                      className="icon_support"
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
