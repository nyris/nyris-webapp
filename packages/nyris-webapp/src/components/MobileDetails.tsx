import React from "react";
import {setMobileDetailsPreview, updateStatusLoading} from "../Store/Search";
import {useAppDispatch} from "../Store/Store";
import {ArrowBackIos} from "@material-ui/icons";
import DetailItem from "./DetailItem";
import {useVisualSearch} from "../hooks/useVisualSearch";

export const MobileDetails = (props: any) => {
    const {handlerFeedback, item, setOpenModalShare} = props;
    const {getUrlToCanvasFile} = useVisualSearch();
    const dispatch = useAppDispatch();

    const onSearchImage = (url:string) => {
        dispatch(updateStatusLoading(true));
        void getUrlToCanvasFile(url);
        dispatch(setMobileDetailsPreview(false));
    }

    return (
        <div style={{width: '100vw'}}>
            <ArrowBackIos style={{position: "absolute", left: 20, zIndex: 100, padding: "10px", cursor: "pointer"}} fontSize={"large"}
                          onClick={() => dispatch(setMobileDetailsPreview(false))}/>
            <DetailItem handlerFeedback={handlerFeedback} dataItem={item} onHandlerModalShare={setOpenModalShare} onSearchImage={onSearchImage}/>
        </div>
    )
}