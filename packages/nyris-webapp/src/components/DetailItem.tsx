import { Box, Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import DefaultCarousel from "./carousel/DefaultCarousel";
import { Link } from "react-router-dom";
import IconSupport from "common/assets/icons/item_support_icon.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconShare from "common/assets/icons/Fill.svg";
import { useState } from "react";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import IconOpenLink from "common/assets/icons/Union.svg";
import IconSearchImage from "common/assets/icons/icon_search_image.svg";
interface Props {
    numberResult?: number;
    results?: any;
    handlerCloseModal: () => void;
    onNextItem?: () => void;
    onPrevItem?: () => void;
    dataItem?: any;
    onHandlerModalShare?: () => void;
    onSearchImage?: any;
    moreInfoText?: string;
}

function DetailItem(props: Props) {
    const { handlerCloseModal, dataItem, onHandlerModalShare, onSearchImage, moreInfoText } =
        props;

    const { img, title, sku, main_image_link, main_offer_link } = dataItem;
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
        <Box className="box-modal-default" borderRadius={12}>
            <Box className="ml-auto" style={{ width: "fit-content", marginRight: 5 }}>
                <Button style={{ padding: 0 }} onClick={handlerCloseModal}>
                    <CloseOutlinedIcon style={{ fontSize: 20, color: "#55566B" }} />
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
                    <img src={IconSearchImage} alt="icon_picture" />
                </Button>
            </Box>

            <Box
                className="box-content"
                display={"flex"}
                style={{ flexDirection: "column", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 19 }}
            >
                <Box className="box-top">
                    <Grid container justifyContent="space-between">
                        <Grid item xs={10}>
                            <Typography className="text-f10 fw-500 max-line-1">
                                SKU: {sku}
                            </Typography>
                            <Typography
                                className="text-f22 fw-600 text-dark"
                                style={{ margin: "20px 0 10px" }}
                            >
                                {title}
                            </Typography>
                            <Link className="text-f10 text-blue" to={"/"} href="#">
                                View full description
                            </Link>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#55566B",
                                    boxShadow: "-2px 2px 4px rgba(170, 171, 181, 0.5)",
                                    borderRadius: 1,
                                    marginBottom: 25,
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
                                    <Typography className="text-f12 fw-600 text-white">
                                        {moreInfoText ? moreInfoText : 'MORE INFO'}
                                    </Typography>
                                    <img src={IconOpenLink} alt="" />
                                </Button>
                            </Box>
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
                                        style={{ width: "30px" }}
                                    />
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box display={"flex"} alignItems={"center"}>
                                <Button className="btn-item">
                                    <img
                                        src={IconDisLike}
                                        alt="image_item"
                                        className="icon_action"
                                        style={{ width: "30px" }}
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
                                        style={{ width: "30px" }}
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
                                            src={IconSupport}
                                            alt="image_item"
                                            className="icon_support"
                                            style={{ width: "30px" }}
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
