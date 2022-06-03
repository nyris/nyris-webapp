import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  TextareaAutosize,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import { useDropzone } from "react-dropzone";
import { makeFileHandler } from "@nyris/nyris-react-components";
import IconUsers from "common/assets/icons/icon_users.svg";
import IconPhone from "common/assets/icons/icon_phone.svg";
import IconEmail from "common/assets/icons/icon_email.svg";
import IconCompany from "common/assets/icons/icon_company.svg";
import IconTextArea from "common/assets/icons/icon_textArea.svg";
interface Props {}

function SupportPage(props: Props) {
  const [imageUpload, setImageUpload] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingLoadFile, setLoadingLoadFile] = useState<any>(false);

  // const onUploadImage = (e: any) => {
  //   let newValue: any[] = [];
  //   Object.values(e.target.files).forEach((val: any, index: any) => {
  //     newValue.push({
  //       value: index,
  //       urlImage: URL.createObjectURL(val),
  //     });
  //   });
  //   setImageUpload(newValue);
  // };

  const onRemoveImage = (value: any) => {
    setLoading(true);
    const newArr = imageUpload;
    setImageUpload(newArr);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  console.log("imageUpload", imageUpload);

  const onChangeLoading = (value: boolean) => {
    setLoading(value);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      onChangeLoading(true);
      console.log("321");
      setLoadingLoadFile(true);
      console.log("fs", fs);
    },
  });

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
            justifyContent={"flex-start"}
            flexDirection={"column"}
          >
            <Typography
              className="text-f12 text-white fw-700"
              style={{ width: 380 }}
            >
              Didn’t find what you were looking for? Share your search with our
              product expert:
            </Typography>
            <Box mt={2} mb={3}>
              <Typography
                className="text-f40 text-white fw-700"
                style={{ width: 380 }}
              >
                New ticket
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className="col-left__bottom">
          <Box style={{ width: 640 }} marginLeft={"auto"}>
            <Box className="box-form">
              <form>
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
                        <Typography className="text-drop-file fw-600">
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
                          // accept={acceptTypes}
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
                          <label
                            htmlFor="select_file"
                            className="text-f20 text-bold"
                          >
                            <span className="box-blue">Choose photo</span> or
                            drag & drop it here
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
                      </>
                    )}
                  </div>
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
                {/* TODO: Box form */}
                <Box mb={2} mt={4} className="box-form-control">
                  <Grid container>
                    <Grid item xs={6} style={{ paddingRight: 10 }}>
                      <Box>
                        <TextField
                          required
                          id="standard-required"
                          label="Name"
                          className="item-field"
                          // defaultValue="Hello World"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconUsers}
                                  alt="icon_user"
                                  width={12}
                                  height={12}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <Box>
                        <TextField
                          required
                          id="standard-required"
                          label="Email"
                          className="item-field"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconEmail}
                                  alt="icon_phone"
                                  width={12}
                                  height={12}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} style={{ paddingLeft: 10 }}>
                      <Box>
                        <TextField
                          id="standard-required"
                          label="Phone number"
                          className="item-field"
                          // defaultValue="Hello World"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconPhone}
                                  alt="icon_phone"
                                  width={12}
                                  height={12}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <Box>
                        <TextField
                          // required
                          id="standard-required"
                          label="Company"
                          className="item-field"
                          // defaultValue="Hello World"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconCompany}
                                  alt="icon_phone"
                                  width={12}
                                  height={12}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box mt={2}>
                        <Typography className="text-white text-f12 fw-500">
                          Message
                        </Typography>
                        <Box mt={1} className="box-textArea">
                          <Box className="box-icon">
                            <img
                              src={IconTextArea}
                              alt="icon_user"
                              width={12}
                              height={12}
                            />
                          </Box>
                          <TextareaAutosize
                            aria-label="minimum height"
                            minRows={3}
                            placeholder="Minimum 3 rows"
                            className="w-100"
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Box display={"flex"} flexDirection={"column"}>
                  <FormControlLabel
                    control={<Checkbox className="text-white" />}
                    label="I consent to being contacted"
                    className="w-100 text-white"
                  />
                  <Button
                    className="text-white fw-700 color border-rd-0"
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#AAABB5",
                      width: "fit-content",
                      borderRadius: 5,
                    }}
                  >
                    Send
                  </Button>
                </Box>
                <Box mt={3} style={{width: '320px'}}>
                  <Typography className="text-f8 text-white fw-600">
                    All personal data will be securely stored in accordance with
                    European GDPR regulations. We do not sell data.
                  </Typography>
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
