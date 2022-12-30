import {Box, Button, Grid, Typography} from "@material-ui/core";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import IconShare from "common/assets/icons/Fill.svg";
import IconDisLike from "common/assets/icons/icon_dislike.svg";
import IconLike from "common/assets/icons/icon_like.svg";
import IconSupport2 from "common/assets/icons/item_support_icon.svg";
import IconOpenLink from "common/assets/icons/Union.svg";
import React, {memo, useEffect, useState} from "react";
// import IconSearchImage from "common/assets/icons/icon_search_image2.svg";
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
    const {sku, title, brand, main_offer_link, collap} = dataItem;

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
                            <ChevronRightOutlinedIcon style={{fontSize: "10px"}}/>
                        </Button>
                    </Box>
                )}
                {isGroupItem && !collap && (
                    <Box className="btn-show-result">
                        <Button onClick={handlerHideGroup}>
                            Close group
                            <ChevronRightOutlinedIcon style={{fontSize: "10px"}}/>
                        </Button>
                    </Box>
                )}
                {!isHover && urlImage?.length > 1 && (
                    <Box className="box-icon-modal">
                        <Button
                            style={{width: "100%", height: "100%", padding: 0, zIndex: 9}}
                            onClick={handlerToggleModal}
                        >
                            <svg
                                width="33"
                                height="32"
                                viewBox="0 0 33 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <ellipse
                                    cx="16.1684"
                                    cy="16"
                                    rx="16.1684"
                                    ry="16"
                                    fill="#F3F3F5"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M19.0497 9.14286C18.7341 9.14286 18.4783 8.88702 18.4783 8.57143C18.4783 8.25584 18.7341 8 19.0497 8H23.6527C23.9841 8 24.2527 8.26863 24.2527 8.6V13.1368C24.2527 13.4558 23.9942 13.7143 23.6753 13.7143C23.3564 13.7143 23.0979 13.4558 23.0979 13.1368V11.3887C23.0979 10.8557 22.4547 10.5873 22.0758 10.9622L18.545 14.4563C18.3207 14.6783 17.9594 14.678 17.7354 14.4557C17.5085 14.2305 17.5088 13.8635 17.7361 13.6387L21.2435 10.1694C21.6246 9.79241 21.3577 9.14286 20.8215 9.14286H19.0497ZM13.7959 17.5429C14.0199 17.3215 14.3806 17.322 14.6038 17.5442C14.8296 17.7689 14.8291 18.1345 14.6026 18.3585L11.0932 21.8306C10.7121 22.2076 10.9791 22.8571 11.5152 22.8571H13.2872C13.6028 22.8571 13.8587 23.113 13.8587 23.4286C13.8587 23.7441 13.6028 24 13.2872 24H8.68423C8.35286 24 8.08423 23.7313 8.08423 23.4V18.8631C8.08423 18.5442 8.34276 18.2857 8.66167 18.2857C8.98059 18.2857 9.23912 18.5442 9.23912 18.8631V20.612C9.23912 21.1449 9.88207 21.4133 10.261 21.0386L13.7959 17.5429Z"
                                    fill="#3E36DC"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.23911 13.1368C9.23911 13.4557 8.98058 13.7142 8.66167 13.7142C8.34276 13.7142 8.08423 13.4557 8.08423 13.1368L8.08423 8.59991C8.08423 8.26854 8.35286 7.99991 8.68423 7.99991L13.2872 7.99991C13.6028 7.99991 13.8587 8.25575 13.8587 8.57134C13.8587 8.88693 13.6028 9.14277 13.2872 9.14277L11.5149 9.14277C10.9789 9.14277 10.7119 9.79219 11.0929 10.1693L14.5999 13.6397C14.8276 13.865 14.8273 14.2329 14.5993 14.4578C14.3751 14.6791 14.0146 14.6788 13.7908 14.4571L10.2613 10.9627C9.88241 10.5877 9.23911 10.856 9.23911 11.3891L9.23911 13.1368ZM17.7362 18.3563C17.509 18.1313 17.5096 17.7641 17.7375 17.5399C17.9612 17.3198 18.3202 17.3203 18.5433 17.5411L22.0757 21.0375C22.4545 21.4125 23.0977 21.1441 23.0977 20.611L23.0977 18.8632C23.0977 18.5442 23.3563 18.2857 23.6752 18.2857C23.9941 18.2857 24.2526 18.5442 24.2526 18.8632L24.2526 23.4C24.2526 23.7314 23.984 24 23.6526 24L19.0496 24C18.734 24 18.4782 23.7442 18.4782 23.4286C18.4782 23.113 18.734 22.8571 19.0496 22.8571L20.8226 22.8571C21.3586 22.8571 21.6257 22.2079 21.2448 21.8308L17.7362 18.3563Z"
                                    fill="#3E36DC"
                                />
                            </svg>
                        </Button>
                    </Box>
                )}
                <Box className="box-image">
                    <Button
                        style={{width: "100%", height: "100%"}}
                        onClick={(e: any) => {
                            e.preventDefault();
                            if (urlImage.length > 1) {
                                onSearchImage(dataItem?.main_image_link);
                            }
                        }}
                    >
                        {urlImage?.length > 1 ? (
                            <img
                                src={main_image_link}
                                key={main_image_link}
                                alt="image_item"
                                className="img-style"
                                style={{width: "100%", height: "100%"}}
                            />
                        ) : (
                            <img
                                src={NoImage}
                                alt="image_item"
                                className="img-style"
                                style={{width: "100%", height: "100%"}}
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
                style={{flexDirection: "column", backgroundColor: "#F3F3F5"}}
            >
                <Box className="box-top">
                    <Grid container justifyContent="space-between">
                        <Grid item xs={12}>
                            <Typography
                                className="text-f10 max-line-1 fw-400"
                                style={{color: "#2B2C46"}}
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
                                    style={{color: "#3E36DC", fontSize: 8}}
                                >
                                    {brand}
                                </Typography>
                            </Box>
                            <Typography
                                className="text-f12 fw-600 max-line-3"
                                style={{color: "#1E1F31"}}
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
                                        style={{textTransform: "uppercase"}}
                                    >
                                        {moreInfoText}
                                    </Typography>
                                    <img src={IconOpenLink} alt=""/>
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/*hidden_as_required
                <Box className="box-bottom" style={{marginBottom: 14}}>
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
                                        style={{width: "1rem"}}
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
                                        style={{width: "1rem"}}
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
                                        style={{width: "1rem"}}
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
                                            style={{width: "1rem"}}
                                        />
                                    </Box>
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>*/}
            </Box>
        </Box>
    );
}

export default memo(ItemResult);
