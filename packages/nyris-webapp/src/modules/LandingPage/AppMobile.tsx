import { Box, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { RectCoords } from "@nyris/nyris-api";
import { showFeedback, showResults } from "Store/Nyris";
import {
  loadingActionResults,
  reset,
  setImageSearchInput,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  updateStatusLoading,
} from "Store/Search";
import { feedbackClickEpic } from "services/Feedback";
import { createImage, findByImage, findRegions } from "services/image";
import { useHistory } from "react-router-dom";
import ExampleImages from "components/ExampleImages";
import CameraCustom from "components/drawer/cameraCustom";
interface Props {}

function AppMobile(props: Props): JSX.Element {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state);
  const { settings } = searchState;
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  useEffect(() => {
    dispatch(reset(""));
  }, []);

  const getUrlToCanvasFile = async (url: string, position?: number) => {
    if (history.location?.pathname === "/") {
      history.push("/result");
    }
    dispatch(updateStatusLoading(true));
    dispatch(showResults());
    dispatch(loadingActionResults());
    dispatch(setImageSearchInput(url));
    if (position) {
      feedbackClickEpic(searchState, position);
    }
    let image = await createImage(url);
    dispatch(setRequestImage(image));
    let searchRegion: RectCoords | undefined = undefined;
    if (settings.regions) {
      let res = await findRegions(image, settings);
      dispatch(setRegions(res.regions));
      searchRegion = res.selectedRegion;
      dispatch(setSelectedRegion(searchRegion));
    }
    findByImage(image, settings, searchRegion)
      .then((res) => {
        dispatch(setSearchResults(res));
        dispatch(updateStatusLoading(false));
        dispatch(showFeedback());
        return;
      })
      .catch((err: any) => {
        console.log("err getUrlToCanvasFile mobile", err);
      });
  };

  return (
    <>
      <Box className="wrap-content-body">
        <Box className="title-top">
          <Typography className="text-center text-white">
            Snap a photo or attach any image in the <br /> following formats:
          </Typography>
          <Typography className="text-center text-white">
            jpg, png, svg, pdf or tiff
          </Typography>
        </Box>
        <Box className="box-drag-mobile">
          <ExampleImages
            images={settings.exampleImages}
            onExampleImageClicked={(url: string) => {
              return getUrlToCanvasFile(url);
            }}
            onToggleModalCamera={() => {
              setOpenModalCamera(!isOpenModalCamera);
            }}
          />
        </Box>
        <Box className="box-screenshot-camera">
          <CameraCustom
            isToggle={isOpenModalCamera}
            onToggleModal={() => {
              setOpenModalCamera(!isOpenModalCamera);
            }}
          />
        </Box>
      </Box>
    </>
  );
}

export default AppMobile;
