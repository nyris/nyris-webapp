import { Box, Typography } from "@material-ui/core";
import React from "react";
import { useDropzone } from "react-dropzone";
import IconSearch from "common/assets/icons/icon_search_image.svg";
import { makeFileHandler } from "@nyris/nyris-react-components";
import { useAppDispatch, useAppSelector } from "Store/Store";
import {createImage, serviceImage, serviceImageNonRegion} from "services/image";
import {
  setSearchResults,
  loadingActionResults,
  searchFileImageNonRegion, setRequestImage,
} from "Store/Search";
import { showFeedback, showResults } from "Store/Nyris";
import { useHistory } from "react-router-dom";
import ExampleImages from "./ExampleImages";
import { feedbackClickEpic } from "services/Feedback";
import { useState } from "react";

interface Props {
  acceptTypes: any;
  onChangeLoading: any;
  isLoading: boolean;
}

function DragDropFile(props: Props) {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { acceptTypes, onChangeLoading, isLoading } = props;
  const searchState = useAppSelector((state) => state);
  const { settings } = searchState;
  const [rectCoords] = useState<any>(undefined);
  const [isLoadingLoadFile, setLoadingLoadFile] = useState<any>(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (fs: File[]) => {
      onChangeLoading(true);
      console.log("321");
      let payload: any;
      let filters: any[] = [];
      setLoadingLoadFile(true);
      console.log("fs", fs);

      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      return serviceImage(image, searchState.settings).then((res: any) => {
        console.log("res?.results", res);

        res?.results.map((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        payload = {
          ...res,
          // results: newResult,
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
    if (position) {
      feedbackClickEpic(searchState, position);
    }

    let image = await createImage(url);
    dispatch(setRequestImage(image));
    if (settings.regions) {
      serviceImage(image, searchState.settings).then((res) => {
        dispatch(setSearchResults(res));
        onChangeLoading(false);
        history.push("/result");
        return dispatch(showFeedback());
      });
    } else {
      serviceImageNonRegion(image, searchState, rectCoords).then((res) => {
        onChangeLoading(false);
        history.push("/result");
        dispatch(searchFileImageNonRegion(res));
      });
    }
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
              // className="inputFile"
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
              <Box className="box-image">
                <img
                  width={27}
                  height={27}
                  src={IconSearch}
                  alt="icon_search"
                />
              </Box>
              <label htmlFor="select_file" className="text-f20 text-bold">
                <span className="box-blue">Choose photo</span> or drag & drop it
                here
              </label>
              <input
                {...getInputProps()}
                type="file"
                name="file"
                id="select_file"
                className="inputFile"
                placeholder="Choose photo"
                style={{ display: "block" }}
                // accept={acceptTypes}
                // onChange={makeFileHandler((e) => {
                //   return isCheckImageFile(e);
                // })}
              />
            </Box>
            <Box style={{ marginTop: 19, zIndex: 109 }} className="box-thumb">
              <Box display={"flex"} alignItems={"flex-end"}>
                <ExampleImages
                  images={settings.exampleImages}
                  onExampleImageClicked={(url: string) => {
                    return getUrlToCanvasFile(url);
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </div>
    </Box>
  );
}

export default DragDropFile;
