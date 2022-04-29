import { Box, Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import DefaultCarousel from "./carousel/DefaultCarousel";
import { Link } from "react-router-dom";
import IconSupport from "common/assets/icons/support.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconShare from "common/assets/icons/Fill.svg";
import IconBookmark from "common/assets/icons/book_mark.svg";
// import IconPicture from "common/assets/icons/icon_picture.png";
import IconPicture from "common/assets/icons/icon_modal_image.svg";
import { useState } from "react";
import { isEmpty } from "lodash";
import { useEffect } from "react";

interface Props {
  numberResult?: number;
  results?: any;
  handlerCloseModal: () => void;
  onNextItem?: () => void;
  onPrevItem?: () => void;
  dataItem?: any;
  onHandlerModalShare?: () => void;
  onSearchImage?: any;
}

function DetailItem(props: Props) {
  const {
    handlerCloseModal,
    dataItem,
    onHandlerModalShare,
    onSearchImage,
  } = props;

  const { img, title, sku, main_image_link } = dataItem;
  const [dataImageCarousel, setDataImageCarouSel] = useState<any[]>([]);

  useEffect(() => {
    checkDataItemResult(dataItem);
  }, [dataItem]);

  const checkDataItemResult = (dataItem: any) => {
    if (!dataItem) {
      return setDataImageCarouSel([]);
    }
    let valueKey: any[] = [];
    const newObject = dataItem;
    for (let key in newObject) {
      if (key?.includes("recognition_image_link")) {
        if (!isEmpty(newObject[key])) {
          valueKey.push({
            url: newObject[key],
          });
        }
      } else {
        if (key === "main_image_link") {
          valueKey.push({
            url: newObject[key],
          });
        }
      }
    }
    setDataImageCarouSel(valueKey);
  };

  return (
    <Box className="box-modal-default">
      <Box className="ml-auto" style={{ width: "fit-content", marginRight: 5 }}>
        <Button style={{ padding: 0 }} onClick={handlerCloseModal}>
          <CloseOutlinedIcon style={{ fontSize: 12, color: "#55566B" }} />
        </Button>
      </Box>

      <Box className="box-carosel">
        <DefaultCarousel imgItem={dataImageCarousel} />
        <Button
          className="icon-style"
          onClick={() => {
            if (!main_image_link) {
              console.log("321");

              return;
            }
            onSearchImage(main_image_link);
            handlerCloseModal();
          }}
        >
          <img src={IconPicture} alt="icon_picture" />
        </Button>
      </Box>

      <Box
        className="box-content"
        display={"flex"}
        style={{ flexDirection: "column" }}
      >
        <Box className="box-top">
          <Grid container justifyContent="space-between">
            <Grid item xs={10}>
              <Typography className="text-f9 fw-500 max-line-1">
                SKU: {sku}
              </Typography>
              <Typography className="text-f16 fw-600 text-dark">
                {title}
              </Typography>
              <Link className="text-f9 text-blue" to={"/"} href="#">
                View full description
              </Link>
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
                <Button className="btn-item">
                  <img
                    src={IconLike}
                    alt="image_item"
                    className="icon_action"
                  />
                </Button>
                <Button className="btn-item">
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
                <Button className="btn-item" onClick={onHandlerModalShare}>
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

export default DetailItem;
