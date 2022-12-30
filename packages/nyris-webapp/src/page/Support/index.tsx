import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  TextareaAutosize,
  TextField,
  Typography,
} from "@material-ui/core";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import { makeFileHandler } from "@nyris/nyris-react-components";
import IconCompany from "common/assets/icons/icon_company.svg";
import IconEmail from "common/assets/icons/icon_email.svg";
import IconPhone from "common/assets/icons/icon_phone.svg";
import IconTextArea from "common/assets/icons/icon_textArea.svg";
import IconUsers from "common/assets/icons/icon_users.svg";
import React, {useLayoutEffect, useState} from "react";
import { useDropzone } from "react-dropzone";
import { useMediaQuery } from "react-responsive";
import {useHistory} from "react-router-dom";
interface Props {}

function SupportPage(props: Props) {
    const [imageUpload, setImageUpload] = useState<any>();
    const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
    const inputFileRef:any = React.useRef(null);
    const inputFileSnapRef:any = React.useRef(null);
    const history = useHistory();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      console.log("fs", fs);
      setImageUpload(URL.createObjectURL(fs[0]));
    },
    });

    const getImageMobile = (e:any) => {
      setImageUpload(URL.createObjectURL(e.target.files[0]));
    }

    useLayoutEffect(() => {
        history.push({
            pathname: '/',
        });
    },[] );

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
            style={
              !isMobile
                ? { width: 640 }
                : {
                    width: "100%",
                    display: "flex",
                    flexDirection: "column-reverse",
                  }
            }
            marginLeft={"auto"}
            display={"flex"}
            justifyContent={"flex-start"}
            flexDirection={"column"}
          >
            <Typography
              className="text-f12 text-white fw-700 text-title-support"
              style={
                !isMobile
                  ? { width: 380 }
                  : { width: "100%", color: "#1E1F31 !important" }
              }
            >
              Didn’t find what you were looking for? Share your search with our
              product expert:
            </Typography>
            <Box mt={2} mb={3}>
              <Typography
                className="text-f40 text-white fw-700 text-title-support"
                style={
                  !isMobile
                    ? { width: 380 }
                    : { width: "100%", color: "#1E1F31 !important" }
                }
              >
                New ticket
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className="col-left__bottom">
          <Box
            className="col-left__bottom__content"
            style={{ width: 640 }}
            marginLeft={"auto"}
          >
            <Box className="box-form">
              <form>
                {!isMobile && !imageUpload && (
                  <Box
                    className={
                      !isDragActive
                        ? `box-content-main`
                        : `box-content-main-drop`
                    }
                  >
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
                            placeholder="Choose photo"
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
                            />
                          </Box>
                        </>
                      )}
                    </div>
                  </Box>
                )}
                {imageUpload && (
                  <Box
                    className="box-preview-image"
                    display={"flex"}
                    flexWrap={"wrap"}
                    style={{
                      width: 250,
                      minHeight: 250,
                      position: "relative",
                      border: "1px solid",
                    }}
                  >
                    <Button
                      style={{ position: "absolute", right: 0, top: 0 }}
                      onClick={() => setImageUpload(null)}
                    >
                      <CloseOutlinedIcon />
                    </Button>
                    <img
                        className="support-img-preview"
                      style={{ height: "100%", width: "100%" }}
                      src={imageUpload}
                      alt={`321`}
                    />
                  </Box>
                )}

                {/* TODO: Box form */}
                <Box mb={2} mt={4} className="box-form-control">
                  <Grid container>
                    <Grid
                      item
                      lg={6}
                      sm={12}
                      style={
                        !isMobile
                          ? { paddingRight: 10 }
                          : { padding: 0, width: "100%" }
                      }
                    >
                      <Box>
                        <TextField
                          required
                          id="standard-required"
                          label="Name"
                          className="item-field"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconUsers}
                                  alt="icon_user"
                                  width={17}
                                  height={17}
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
                                  width={17}
                                  height={17}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      lg={6}
                      sm={12}
                      style={
                        !isMobile
                          ? { paddingRight: 10 }
                          : { padding: 0, width: "100%" }
                      }
                    >
                      <Box>
                        <TextField
                          id="standard-required"
                          label="Phone number"
                          className="item-field"
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconPhone}
                                  alt="icon_phone"
                                  width={17}
                                  height={17}
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
                          InputProps={{
                            className: "box-input-control",
                            startAdornment: (
                              <InputAdornment position="start">
                                <img
                                  src={IconCompany}
                                  alt="icon_phone"
                                  width={17}
                                  height={17}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box mt={2}>
                        <Typography className="text-white text-f12 fw-500 text-title-support">
                          Message
                        </Typography>
                        <Box mt={1} className="box-textArea">
                          <Box className="box-icon">
                            <img
                              src={IconTextArea}
                              alt="icon_user"
                              width={17}
                              height={17}
                            />
                          </Box>
                          <TextareaAutosize
                            aria-label="minimum height"
                            minRows={!isMobile ? 3 : 1}
                            placeholder="Minimum 3 rows"
                            className="w-100"
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                {isMobile && (
                  <Box
                    className="box-choose-file-mobile w-100"
                    display={"flex"}
                  >
                    <Box className="col-left">
                      <Button onClick={()=>{
                          inputFileRef.current.click();
                      }}>
                        <Typography
                          className="text-f14 fw-700"
                          style={{ fontSize: 14, textTransform:"none"  }}
                        >
                          Choose file
                        </Typography>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.075 8.48134L5.575 0.981342C4.325 -0.318658 2.275 -0.318658 0.975 0.931342C-0.325 2.18134 -0.325 4.28134 0.975 5.53134L1.025 5.58134L2.425 7.03134L3.125 6.33134L1.675 4.88134C0.825 4.03134 0.825 2.58134 1.675 1.73134C2.525 0.881342 3.975 0.831342 4.825 1.68134C4.825 1.68134 4.825 1.68134 4.875 1.73134L12.325 9.18134C13.225 10.0313 13.225 11.4813 12.375 12.3313C11.525 13.2313 10.075 13.2313 9.225 12.3813C9.225 12.3813 9.225 12.3813 9.175 12.3313L5.475 8.63134C4.975 8.13134 5.025 7.33134 5.475 6.88134C5.975 6.43134 6.725 6.43134 7.225 6.88134L9.275 8.93134L9.975 8.23134L7.875 6.13134C6.975 5.28134 5.575 5.33134 4.725 6.23134C3.925 7.08134 3.925 8.43134 4.725 9.33134L8.475 13.0813C9.725 14.3813 11.775 14.3813 13.075 13.1313C14.375 11.8813 14.375 9.78134 13.075 8.48134C13.075 8.53134 13.075 8.48134 13.075 8.48134Z"
                            fill="#1E1F31"
                          />
                        </svg>
                      </Button>
                        <input hidden type="file" ref={inputFileRef} onChange={getImageMobile}/>
                    </Box>

                    <Box className="col-right">
                      <Button onClick={()=>{inputFileSnapRef.current.click()}}>
                        <Typography
                          className="text-f14 fw-700"
                          style={{ fontSize: 14, textTransform:"none" }}
                        >
                          Snap a picture
                        </Typography>
                        <svg
                          width="16"
                          height="13"
                          viewBox="0 0 16 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M16 12C16 12.3156 15.7442 12.5714 15.4286 12.5714H0.571429C0.255837 12.5714 0 12.3156 0 12V2.28571C0 1.97012 0.255837 1.71429 0.571429 1.71429H4.26286L5.24 0.257143C5.34513 0.0974942 5.52313 0.000988941 5.71429 0H10.2857C10.4769 0.000988941 10.6549 0.0974942 10.76 0.257143L11.7371 1.71429H15.4286C15.7442 1.71429 16 1.97012 16 2.28571V12ZM1.14286 11.4286H14.8571V2.85714H11.4286C11.2374 2.85615 11.0594 2.75964 10.9543 2.6L9.97714 1.14285H6.02286L5.04571 2.6C4.94058 2.75964 4.76258 2.85615 4.57143 2.85714H1.14286V11.4286ZM8 10.2857C6.10645 10.2857 4.57143 8.75068 4.57143 6.85713C4.57143 4.96358 6.10645 3.42856 8 3.42856C9.89355 3.42856 11.4286 4.96358 11.4286 6.85713C11.4286 8.75068 9.89355 10.2857 8 10.2857ZM8 4.57143C6.73764 4.57143 5.71429 5.59478 5.71429 6.85714C5.71429 8.11951 6.73764 9.14286 8 9.14286C9.26237 9.14286 10.2857 8.11951 10.2857 6.85714C10.2857 5.59478 9.26237 4.57143 8 4.57143Z"
                            fill="#1E1F31"
                          />
                        </svg>
                      </Button>
                        <input hidden type="file" ref={inputFileSnapRef} onChange={getImageMobile}/>

                    </Box>
                  </Box>)}

                  {

                      (isMobile && imageUpload) && (
                          <Box
                              className="box-preview-image-mobile"
                              display={"flex"}
                              flexWrap={"wrap"}
                              style={{
                                  width: 100,
                                  minHeight: 100,
                                  position: "relative",
                                  border: "1px solid",
                                  marginTop: "10px"
                              }}
                          >
                              <Button
                                  style={{ position: "absolute", right: 0, top: 0, padding: 0 }}
                                  onClick={() => setImageUpload(null)}
                              >
                                  <CloseOutlinedIcon />
                              </Button>
                              <img
                                  className="support-img-preview"
                                  style={{ height: "100%", width: "100%" }}
                                  src={imageUpload}
                                  alt={`321`}
                              />
                          </Box>
                      )
                  }
                <Box display={"flex"} flexDirection={"column"}>
                  <FormControlLabel
                    control={<Checkbox className="text-white" />}
                    label="I consent to being contacted"
                    className="w-100 text-white"
                  />
                  {!isMobile ? (
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
                  ) : (
                    <Button
                      className="text-white fw-700 color border-rd-0 btn-submit-support"
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#3E36DC",
                        width: "100%",
                        borderRadius: 5,
                          marginBottom: "40px"
                      }}
                    >
                      SEND MESSAGE
                    </Button>
                  )}
                </Box>
                {!isMobile && (
                  <Box mt={3} style={{ width: "320px" }}>
                    <Typography className="text-f8 text-white fw-600">
                      All personal data will be securely stored in accordance
                      with European GDPR regulations. We do not sell data.
                    </Typography>
                  </Box>
                )}
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