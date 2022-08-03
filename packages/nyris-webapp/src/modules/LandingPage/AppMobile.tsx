import { Box, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { cadExtensions, RectCoords } from "@nyris/nyris-api";
import { showFeedback, showResults } from "Store/Nyris";
import {
  loadingActionResults,
  setImageSearchInput,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
} from "Store/Search";
import { feedbackClickEpic } from "services/Feedback";
import { createImage, findByImage, findRegions } from "services/image";
import { useHistory } from "react-router-dom";
import ExampleImages from "components/ExampleImages";
import CameraCustom from "components/drawer/cameraCustom";
import Webcam from "react-webcam";
interface Props {}

function AppMobile(props: Props): JSX.Element {
  const {} = props;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state);
  const { settings, search } = searchState;
  const acceptTypes = ["image/*"]
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(",");
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  const getUrlToCanvasFile = async (url: string, position?: number) => {
    // onChangeLoading(true);
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
    return findByImage(image, settings, searchRegion).then((res) => {
      dispatch(setSearchResults(res));
      // onChangeLoading(false);
      history.push("/result");
      return dispatch(showFeedback());
    });
  };

  return (
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
          onToggleModal={() => {
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
  );
}

export default AppMobile;
