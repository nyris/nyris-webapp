import { useDropzone } from "react-dropzone";
import {
  makeStyles,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  CssBaseline,
  Fab,
  Grid,
  Hidden,
  Typography,
} from "@material-ui/core";
import { PhotoCamera, ArrowBack, Image } from "@material-ui/icons";
import Icon from "@material-ui/core/Icon";
import React, { useCallback, useEffect, useState } from "react";
import { NodeGroup } from "react-move";
import classNames from "classnames";
import {Capture, Preview} from "@nyris/nyris-react-components";
import { useAppDispatch, useAppSelector } from "Store/Store";
import {
  RectCoords,
  cadExtensions,
  isCadFile,
  isImageFile,
  ImageSearchOptions,
} from "@nyris/nyris-api";
import NyrisAPI from "@nyris/nyris-api";
import {
  loadCadFileLoad,
  loadFile,
  loadFileSelectRegion,
  loadingActionRegions,
  loadingActionResults,
  searchFileImageNonRegion,
  // selectionChanged,
} from "Store/Search";
import { showCamera, showFeedback, showResults, showStart } from "Store/Nyris";
import _, { debounce, isEmpty } from "lodash";
import { serviceImage, serviceImageNonRegion } from "services/image";
import { findByImage } from "services/findByImage";
import { feedbackRegionEpic } from "services/Feedback";
import { MDSettings } from "../../types";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
    transition: "all 300ms",
    overflow: "hidden",
    height: 500,
  },
  heroContentClosed: {
    height: 0,
    padding: 0,
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    minHeight: 600,
    overflow: "hidden",
    transition: "all 300ms",
  },
  cardGridCollapsed: {
    height: 0,
    opacity: 0,
    minHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
    backgroundSize: "contain",
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  withElipsis: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  loading: {
    margin: theme.spacing(2),
  },
  fabContainer: {
    position: "fixed",
    bottom: theme.spacing(2),
  },
  fab: {
    marginLeft: theme.spacing(2),
  },
}));

const makeFileHandler = (action: any) => (e: any) => {
  let file = (e.dataTransfer && e.dataTransfer.files[0]) || e.target.files[0];
  if (e.target && e.target.value) {
    e.target.value = "";
  }

  if (file) {
    action(file);
  }
};

const LandingPageAppMD: React.FC<any> = () => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [rectCoords, setRectCoords] = useState<any>();
  const searchState = useAppSelector((state) => state);
  const { settings, search, nyris } = searchState;
  const { showPart } = nyris;
  const {
    requestImage,
    regions,
    selectedRegion,
    fetchingRegions,
    fetchingResults,
    results,
    requestId,
  } = search;
  const { themePage }: any = settings;
  useEffect(() => {
    if (isEmpty(rectCoords)) {
      return;
    }
    onSearchOffersForImage(rectCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rectCoords]);

  const loading = fetchingRegions || fetchingResults;

  const mdSettings: any = themePage.materialDesign as MDSettings;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => dispatch(loadFile(fs[0])),
  });

  // const minPreviewHeight = 400;
  // const halfOfTheScreenHeight = Math.floor(window.innerHeight * 0.45);
  // const maxPreviewHeight = Math.max(minPreviewHeight, halfOfTheScreenHeight);
  const acceptTypes = ["image/*"]
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(",");

  const isCheckImageFile = async (file: any) => {
    dispatch(showResults());
    dispatch(loadingActionResults());
    dispatch(showFeedback());
    if (isImageFile(file) || typeof file === "string") {
      if (settings.regions) {
        serviceImage(file, searchState).then((res) => {
          dispatch(loadFile(res));
          return dispatch(showFeedback());
        });
      } else {
        serviceImageNonRegion(file, searchState, rectCoords).then((res) => {
          dispatch(searchFileImageNonRegion(res));
        });
      }
      // return serviceImage(file, settings).then((res) => {
      //   return dispatch(loadFile(res));
      // });
    }
    if (isCadFile(file)) {
      return dispatch(loadCadFileLoad(file));
    }
  };

  const feedbackClickEpic = async (position: any, _url: string) => {
    try {
      const api = new NyrisAPI(settings);
      const sessionId = search.sessionId || search.requestId;
      if (sessionId && requestId) {
        await api.sendFeedback(sessionId, requestId, {
          event: "click",
          data: { positions: [position] },
        });
      }
    } catch (error) {
      console.log("err feedbackClickEpic", error);
    }
  };

  const handlerRectCoords = debounce((value) => {
    setRectCoords(value);
  }, 1200);

  const debounceRectCoords = useCallback(
    (value) => handlerRectCoords(value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onSearchOffersForImage = (r: RectCoords) => {
    const { canvas }: any = requestImage;
    let options: ImageSearchOptions = {
      cropRect: r,
    };
    feedbackRegionEpic(searchState, r);
    dispatch(loadingActionRegions());
    return findByImage(canvas, options, settings).then((res) => {
      dispatch(loadFileSelectRegion(res));
      return dispatch(showFeedback());
    });
  };

  return (
    <React.Fragment>
      {!_.isEmpty(mdSettings?.resultLinkIcon) && (
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      )}
      <CssBaseline />
      {showPart === "camera" && (
        <Capture
          onCaptureComplete={(image: HTMLCanvasElement) =>
            isCheckImageFile(image)
          }
          onCaptureCanceled={() => dispatch(showStart)}
          useAppText="Use default camera app"
        />
      )}
      <main>
        <div
          className={classNames(
            classes.heroContent,
            showPart === "results" ? classes.heroContentClosed : null
          )}
        >
          <Container maxWidth="md">
            <div>
              <Hidden mdUp>
                <div style={{ textAlign: "center" }}>
                  <PhotoCamera style={{ fontSize: "20em", color: "#cccccc" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <Button
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => {
                      return dispatch(showCamera);
                    }}
                  >
                    Take a picture
                  </Button>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Typography>or</Typography>
                </div>
                <div style={{ textAlign: "center" }}>
                  <input
                    accept={acceptTypes}
                    id="raised-button-file"
                    type="file"
                    onChange={makeFileHandler((e: any) => isCheckImageFile(e))}
                    style={{
                      width: ".1px",
                      height: ".1px",
                      overflow: "hidden",
                      opacity: 0,
                    }}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      component="span"
                    >
                      Select a file
                    </Button>
                  </label>
                </div>
              </Hidden>
              <Hidden smDown>
                <div
                  style={{
                    borderStyle: "dashed",
                    borderWidth: 5,
                    borderColor: isDragActive ? "#ccc" : "#eee",
                    borderRadius: 10,
                    padding: 10,
                    paddingBottom: 30,
                  }}
                  {...getRootProps({
                    onClick: (e) => {
                      e.stopPropagation();
                    },
                  })}
                >
                  <div style={{ textAlign: "center" }}>
                    <Image style={{ fontSize: "20em", color: "#cccccc" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Typography variant="body2">DROP AN IMAGE</Typography>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Typography variant="subtitle2">or</Typography>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <input
                      accept={acceptTypes}
                      id="raised-button-file"
                      type="file"
                      {...getInputProps()}
                      onChange={makeFileHandler((e: any) => {
                        return isCheckImageFile(e);
                      })}
                      style={{
                        width: ".1px",
                        height: ".1px",
                        overflow: "hidden",
                        opacity: 0,
                      }}
                    />
                    <label htmlFor="raised-button-file">
                      <Button
                        variant={"contained"}
                        color={"primary"}
                        component="span"
                      >
                        Select an image
                      </Button>
                    </label>
                  </div>
                </div>
              </Hidden>
            </div>
          </Container>
        </div>
        <Container
          className={classNames(
            classes.cardGrid,
            showPart !== "results" && classes.cardGridCollapsed
          )}
          maxWidth="md"
        >
          {requestImage && (
            <Card style={{ marginBottom: "4em" }} raised={true}>
              <Preview
                key={requestImage?.id}
                onSelectionChange={(r: RectCoords) => {
                  debounceRectCoords(r);
                  return;
                }}
                image={requestImage?.canvas}
                selection={selectedRegion}
                regions={regions}
                maxWidth={400}
                maxHeight={500}
                dotColor="#FBD914"
              />
            </Card>
          )}

          {loading && (
            <div style={{ textAlign: "center" }}>
              <CircularProgress className={classes.loading} />
            </div>
          )}

          <Grid container spacing={4}>
            <NodeGroup
              data={results}
              keyAccessor={(r) => r.position + r.sku}
              start={(r, i) => ({ opacity: 0, translateX: -100 })}
              enter={(r, i) => ({
                opacity: [1],
                translateX: [0],
                timing: { delay: i * 100, duration: 300 },
              })}
            >
              {(rs) => (
                <>
                  {rs.map(({ key, data: result, state }) => (
                    <Grid item key={key} xs={12} sm={4} md={3}>
                      <Card
                        className={classes.card}
                        style={{
                          opacity: state.opacity,
                          position: "relative",
                          transform: `translateX(${state.translateX}%)`,
                        }}
                      >
                        <CardMedia
                          className={classes.cardMedia}
                          image={
                            (result.img && result.img.url) ||
                            settings.noImageUrl
                          }
                          title={result.title}
                        />
                        <CardContent className={classes.cardContent}>
                          <Typography
                            gutterBottom
                            variant="subtitle2"
                            component="h5"
                            className={classes.withElipsis}
                          >
                            {result[mdSettings.resultFirstRowProperty]}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={classes.withElipsis}
                          >
                            {result[mdSettings.resultSecondRowProperty]}
                          </Typography>
                        </CardContent>
                        {result.l && (
                          <CardActions>
                            <Button
                              variant="outlined"
                              style={{ marginLeft: "auto" }}
                              size="small"
                              color="primary"
                              onClick={
                                () => {
                                  return feedbackClickEpic(
                                    result.position,
                                    result.l
                                  );
                                }
                                // handlers.onLinkClick(result.position, result.l)
                              }
                              onAuxClick={() => {
                                return feedbackClickEpic(
                                  result.position,
                                  result.l
                                );
                              }}
                            >
                              {mdSettings.resultLinkIcon && (
                                <React.Fragment>
                                  <Icon>{mdSettings.resultLinkIcon}</Icon>{" "}
                                </React.Fragment>
                              )}
                              {mdSettings.resultLinkText}
                            </Button>
                          </CardActions>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </>
              )}
            </NodeGroup>
          </Grid>

          {results.length === 0 && showPart === "results" && !loading && (
            <Typography variant="h3" align="center">
              We did not find anything
            </Typography>
          )}
        </Container>
        {showPart !== "start" && (
          <Container maxWidth="lg">
            <div className={classes.fabContainer}>
              <Fab
                aria-label="back"
                className={classes.fab}
                color="primary"
                onClick={() => dispatch(showStart(""))}
              >
                <ArrowBack />
              </Fab>
            </div>
          </Container>
        )}
      </main>
    </React.Fragment>
  );
};

export default LandingPageAppMD;
