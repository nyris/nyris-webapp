import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextareaAutosize,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import PhotoCameraOutlinedIcon from "@material-ui/icons/PhotoCameraOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
interface Props {}

function SupportPage(props: Props) {
  const [imageUpload, setImageUpload] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const onUploadImage = (e: any) => {
    let newValue: any[] = [];
    Object.values(e.target.files).forEach((val: any, index: any) => {
      newValue.push({
        value: index,
        urlImage: URL.createObjectURL(val),
      });
    });
    setImageUpload(newValue);
  };

  const onRemoveImage = (value: any) => {
    setLoading(true);
    const newArr = imageUpload;
    setImageUpload(newArr);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  console.log("imageUpload", imageUpload);

  return (
    <Box className="wrap-main-support-page" display={"flex"}>
      <Box className="col-left">
        <Box
          className="col-left__top"
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Box
            style={{ width: 640 }}
            marginLeft={"auto"}
            display={"flex"}
            justifyContent={"center"}
          >
            <Typography
              className="text-f40 text-white fw-700"
              style={{ width: 442 }}
            >
              Didn’t find what you were looking for?
            </Typography>
          </Box>
        </Box>
        <Box className="col-left__bottom">
          <Box style={{ width: 640 }} marginLeft={"auto"}>
            <Box className="box-form">
              <form>
                <Box mb={1}>
                  <Typography className="text-white text-f12">
                    Share your search with our product expert:
                  </Typography>
                </Box>
                <Box className="box-btn-upload" mb={1}>
                  <input
                    accept="image/*"
                    id="contained-button-file"
                    multiple
                    type="file"
                    style={{ display: "none" }}
                    onChange={onUploadImage}
                  />
                  <label htmlFor="contained-button-file">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      className="btn-upload"
                    >
                      Open file
                      <PhotoCameraOutlinedIcon style={{ fontSize: 12 }} />
                    </IconButton>
                  </label>
                </Box>
                {!isLoading ? (
                  <Box
                    className="box-preview-image"
                    display={"flex"}
                    flexWrap={"wrap"}
                  >
                    {imageUpload &&
                      imageUpload.map((item: any, index: any) => {
                        return (
                          <Box className="box-image w-100" key={index}>
                            <Button
                              className="btn-close w-100"
                              onClick={() => {
                                const newValue = index;
                                onRemoveImage(newValue);
                              }}
                            >
                              <CloseOutlinedIcon style={{ fontSize: 12 }} />
                            </Button>
                            <img
                              style={{ height: "100%" }}
                              src={item.urlImage}
                              key={index}
                              alt={`${index}`}
                            />
                          </Box>
                        );
                      })}
                  </Box>
                ) : (
                  <CircularProgress />
                )}

                <Box mb={2}>
                  <Typography className="text-white text-f12">
                    Or leave a message:
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography className="text-white text-f8">
                      Message
                    </Typography>
                  </Box>
                  <TextareaAutosize
                    placeholder="Message"
                    minRows={1}
                    // style={{height: 'fit-content'}}
                    className="text-f9 textarea-ct w-100"
                  />
                </Box>
                <Box display={"flex"}>
                  <Button className="text-white text-f9 fw-700 bg-dark w-50 border-rd-0">
                    Cancel
                  </Button>
                  <Button className="text-white text-f9 fw-700 bg-pink2 w-50 border-rd-0">
                    Send
                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="col-right"></Box>
    </Box>
  );
}

export default SupportPage;
