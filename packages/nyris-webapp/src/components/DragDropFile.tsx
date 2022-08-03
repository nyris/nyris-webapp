import { Box, Typography } from "@material-ui/core";
import React from "react";
import { useDropzone } from "react-dropzone";
import { makeFileHandler } from "@nyris/nyris-react-components";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { createImage, findByImage, findRegions } from "services/image";
import {
  setSearchResults,
  loadingActionResults,
  setRequestImage,
  setRegions,
  setSelectedRegion,
  setImageSearchInput,
} from "Store/Search";
import { showFeedback, showResults } from "Store/Nyris";
import { useHistory } from "react-router-dom";
import ExampleImages from "./ExampleImages";
import { feedbackClickEpic } from "services/Feedback";
import { useState } from "react";
import { RectCoords } from "@nyris/nyris-api";
import IconDownload from "common/assets/images/Icon_downLoad.svg";
interface Props {
  acceptTypes: any;
  onChangeLoading?: any;
  isLoading?: boolean;
}

function DragDropFile(props: Props) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { acceptTypes, onChangeLoading, isLoading } = props;
  const searchState = useAppSelector((state) => state);
  const { settings } = searchState;
  const [isLoadingLoadFile, setLoadingLoadFile] = useState<any>(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[]) => {
      onChangeLoading(true);
      console.log("321");
      let payload: any;
      let filters: any[] = [];
      setLoadingLoadFile(true);
      console.log("fs", fs);
      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      // TODO support regions
      return findByImage(image, settings).then((res: any) => {
        res?.results.map((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        payload = {
          ...res,
          filters,
        };
        console.log("payload", payload);
        dispatch(setSearchResults(payload));
        setLoadingLoadFile(false);
        onChangeLoading(false);
        history.push("/result");
        return dispatch(showFeedback());
      });
    },
  });

  const getUrlToCanvasFile = async (url: string, position?: number) => {
    onChangeLoading(true);
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
      onChangeLoading(false);
      history.push("/result");
      return dispatch(showFeedback());
    });
  };

  return (
    <Box
      className={
        !isDragActive && !isLoadingLoadFile
          ? `box-content-main`
          : `box-content-main-drop`
      }
    >
      {isLoading && (
        <Box className="loadingSpinCT">
          <Box className="box-content-spin"></Box>
        </Box>
      )}

      <div
        className={`box-border`}
        style={{ position: "relative" }}
        {...getRootProps({
          onClick: (e) => {
            e.stopPropagation();
          },
        })}
      >
        {isDragActive ? (
          <Box>
            <Typography className="text-drop-file">
              DRAG <span className="tractor">&</span> DROP
            </Typography>
            <input
              {...getInputProps({
                onClick: (e) => {
                  e.stopPropagation();
                },
              })}
              type="file"
              name="file"
              id="select_file"
              placeholder="Choose photo"
              accept={acceptTypes}
              onChange={makeFileHandler((e) => {})}
            />
          </Box>
        ) : (
          <>
            <Box
              className="box-content-drop"
              {...getRootProps({
                onClick: (e) => {
                  e.stopPropagation();
                },
              })}
            >
              <Box style={{ marginBottom: 16 }}>
                <img src={IconDownload} alt="" width={48} height={48} />
              </Box>
              <label
                htmlFor="select_file"
                className=""
                style={{ color: "#2B2C46", fontSize: 14 }}
              >
                <span className="fw-700">Choose a image</span> or drag it here
              </label>
              <input
                {...getInputProps()}
                type="file"
                name="file"
                id="select_file"
                className="inputFile"
                placeholder="Choose photo"
                style={{ display: "block" }}
              />
            </Box>
            {/* <Box style={{ marginTop: 19, zIndex: 109 }} className="box-thumb">
              <Box display={"flex"} alignItems={"flex-end"}>
                <ExampleImages
                  images={settings.exampleImages}
                  onExampleImageClicked={(url: string) => {
                    return getUrlToCanvasFile(url);
                  }}
                />
              </Box>
            </Box> */}
          </>
        )}
      </div>
    </Box>
  );
}

export default DragDropFile;
