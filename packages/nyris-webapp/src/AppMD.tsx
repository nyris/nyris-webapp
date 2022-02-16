import { useDropzone } from "react-dropzone";
import {
  makeStyles,
  AppBar,
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
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { PhotoCamera, ArrowBack, Image } from "@material-ui/icons";
import Icon from "@material-ui/core/Icon";
import * as React from "react";
import { NodeGroup } from "react-move";
import classNames from "classnames";
import { Capture, Preview } from "@nyris/nyris-react-components";
import { defaultMdSettings } from "./defaults";
import { useAppDispatch, useAppSelector } from "App/Store";
import {
  RectCoords,
  cadExtensions,
  isCadFile,
  isImageFile,
  ImageSearchOptions,
  urlOrBlobToCanvas,
} from "@nyris/nyris-api";
import NyrisAPI, { selectFirstCenteredRegion } from "@nyris/nyris-api";
import {
  loadCadFileLoad,
  loadFile,
  selectionChanged,
} from "App/Store/Search";
import { showCamera, showStart } from "App/Store/Nyris";
import _ from "lodash";

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

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Powered by "}
      <Link
        color="inherit"
        href="https://nyris.io/"
        component="a"
        target="_blank"
      >
        nyris.io
      </Link>
    </Typography>
  );
}

const AppMD: React.FC<any> = () => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
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

  const loading = fetchingRegions || fetchingResults;

  const mdSettings: any = settings.materialDesign
    ? settings.materialDesign
    : defaultMdSettings;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => dispatch(loadFile(fs[0])),
  });

  const minPreviewHeight = 400;
  const halfOfTheScreenHeight = Math.floor(window.innerHeight * 0.45);
  const maxPreviewHeight = Math.max(minPreviewHeight, halfOfTheScreenHeight);
  const acceptTypes = ["image/*"]
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(",");

  const isCheckImageFile = async (file: any) => {
    if (isImageFile(file)) {
      const api = new NyrisAPI(settings);
      const image = await urlOrBlobToCanvas(file);
      const randomId = Math.random().toString();
      const imageFileCanvas = { canvas: image, id: randomId };
      const regions = await api.findRegions(image).then((res) => res);
      let selection = selectFirstCenteredRegion(regions, 0.3, {
        x1: 0,
        x2: 1,
        y1: 0,
        y2: 1,
      });
      let options: ImageSearchOptions = {
        cropRect: selection,
      };
      const { results, duration, requestId, categoryPredictions, codes } =
        await api.findByImage(image, options);
      const payload = {
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        requestImage: imageFileCanvas,
      };
      return dispatch(loadFile(payload));
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
      <AppBar
        position={"relative"}
        style={{ backgroundColor: mdSettings.appBarCustomBackgroundColor }}
      >
        <Container
          maxWidth="md"
          style={{ flexDirection: "row", display: "flex" }}
        >
          <img
            src={mdSettings.appBarLogoUrl}
            style={{ height: "2em", minHeight: "64px", display: "flex" }}
            alt="Logo"
          />
          <Toolbar component="span">
            <Typography style={{ color: mdSettings.appBarCustomTextColor }}>
              {mdSettings.appBarTitle}
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

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
                      onChange={makeFileHandler((e: any) =>
                        isCheckImageFile(e)
                      )}
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
                key={requestImage.id}
                maxWidth={document.body.clientWidth}
                maxHeight={maxPreviewHeight}
                dotColor={mdSettings.primaryColor}
                onSelectionChange={(r: RectCoords) => {
                  dispatch(selectionChanged(r));
                }}
                regions={regions}
                selection={selectedRegion}
                image={requestImage.canvas}
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
                onClick={() => dispatch(showStart)}
              >
                <ArrowBack />
              </Fab>
            </div>
          </Container>
        )}
      </main>

      <footer className={classes.footer}>
        <Typography variant="subtitle1" align="center" color="textSecondary">
          {requestId && showPart === "results" && (
            <div
              style={{
                textAlign: "center",
                fontSize: "0.7em",
                paddingTop: "0.8em",
              }}
            >
              Request identifier {requestId}
            </div>
          )}
        </Typography>
        <Copyright />
      </footer>
    </React.Fragment>
  );
};

export default AppMD;
