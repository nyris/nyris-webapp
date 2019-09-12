import './App.css';
import React, {ChangeEvent} from 'react';
import Result from './components/Result';
import Preview from './components/Preview';
import ExampleImages from './components/ExampleImages';
import Feedback from './components/Feedback';
import CategoryFilter from "./components/CategoryFilter";
import PredictedCategories from "./components/PredictedCategories";
import {useDropzone} from "react-dropzone";
import classNames from 'classnames';
import {Animate, NodeGroup} from "react-move";
import {MDSettings, RectCoords, Region} from "./types";
import {NyrisAppPart, NyrisFeedbackState} from "./actions/nyrisAppActions";
import Capture from "./components/Capture";
import {
    AppBar,
    Button, Card, CardActions, CardContent,
    CardMedia, CircularProgress,
    Container,
    CssBaseline, Fab,
    Grid, Hidden,
    Link,
    makeStyles,
    Toolbar,
    Typography
} from "@material-ui/core";
import {PhotoCamera, ArrowBack, Image} from "@material-ui/icons";


const makeFileHandler = (action: any) => (e: any) => {
    let file = (e.dataTransfer && e.dataTransfer.files[0]) || e.target.files[0];
    action(file);
};

export interface AppHanders {
    onExampleImageClick: (url: string) => void,
    onImageClick: (position: number, url: string) => void,
    onLinkClick: (position: number, url: string) => void,
    onFileDropped: (file: File) => void,
    onCaptureComplete: (image: HTMLCanvasElement) => void,
    onCaptureCanceled: () => void,
    onSelectFile: (f: File) => void,
    onCameraClick: () => void,
    onShowStart: () => void,
    onSelectionChange: (r: Region) => void,
    onPositiveFeedback: () => void,
    onNegativeFeedback: () => void,
    onCloseFeedback: () => void,
}

export interface AppProps {
    search: {
        results: any[],
        requestId?: string,
        duration?: number,
        categoryPredictions: { name: string, score: number }[],
        filterOptions: string[],
        errorMessage?: string,
        regions: Region[],
        initialRegion: Region
    },
    previewImage?: HTMLCanvasElement,
    settings: any,
    loading: boolean,
    showPart: NyrisAppPart,
    feedbackState: NyrisFeedbackState,
    handlers: AppHanders,
    mdSettings: MDSettings
}

const App: React.FC<AppProps> = ({
                                     search: {results, regions, initialRegion, requestId, duration, errorMessage, filterOptions, categoryPredictions},
                                     showPart, settings, handlers, loading, previewImage, feedbackState
                                 }) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop: (fs: File[]) => handlers.onFileDropped(fs[0])});
    return (
        <div>
            {showPart === 'camera' &&
            <Capture onCaptureComplete={handlers.onCaptureComplete} onCaptureCanceled={handlers.onCaptureCanceled}
                     onFileSelected={makeFileHandler(handlers.onSelectFile)} useAppText='Use default camera app'/>}
            <div className={classNames('headSection', {hidden: showPart === 'results'})} id="headSection">
                <div className="navWrap">
                    <div className="wrapper">
                        <section id="branding"/>
                        <div id="menu" className="menuWrap" role="navigation">
                            <ul>
                                <li><a href="https://nyris.io/imprint/#privacy" target="_blank"
                                       rel="noopener noreferrer">Privacy Policy</a></li>
                                <li><a href="https://nyris.io/" target="_blank" rel="noopener noreferrer">Visit our
                                    Website</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div   {...getRootProps({
                    onClick: e => {
                        e.stopPropagation();
                    }
                })} className={classNames('wrapper', 'dragAndDropActionArea', {'fileIsHover': isDragActive})}>
                    <div className="contentWrap">
                        <section className="uploadImage">
                            <input type="button" name="file" id="capture" className="inputfile" accept="image/*"
                                   capture="environment" onClick={handlers.onCameraClick}/>
                            <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                                   capture="environment"/>
                            <input {...getInputProps()} type="file" name="file" id="select_file" className="inputfile"
                                   accept="image/*"
                                   onChange={makeFileHandler(handlers.onSelectFile)}
                            />
                            <div className="onDesktop">
                                Drop an image
                                <div className="smallText">or</div>
                            </div>
                            <div className="onMobile camIcon">
                                <img src="./images/ic_cam_large.svg" alt="Camera"/>
                            </div>
                            <label htmlFor="capture" className="btn primary onMobile"
                                   style={{marginBottom: '2em', width: '22em'}}>
                                <span className="onMobile">Take a picture</span>
                            </label>
                            <br/>
                            <label htmlFor="select_file" className="btn primary" style={{width: '22em'}}>
                                <span>Select a file</span>
                            </label>
                            <label htmlFor="capture" className="mobileUploadHandler onMobile"/>
                        </section>
                        <ExampleImages images={settings.exampleImages} onExampleImageClicked={handlers.onExampleImageClick}/>
                    </div>
                </div>
                <div className={classNames('tryDifferent', {hidden: showPart !== 'results'})}
                     onClick={handlers.onShowStart}>
                    <div className="icIcon">
                    </div>
                    <div className="textDesc"> Try a different image</div>
                    <br style={{clear: 'both'}}/>
                </div>
                <div className="headerSeparatorTop"/>
                <div className="headerSeparatorBack"/>
            </div>

            <section
                className={classNames('results', {resultsActive: showPart === 'results'}, (results.length === 1 ? 'singleProduct' : 'multipleProducts'))}>
                {errorMessage &&
                <div className="errorMsg">
                    {errorMessage}
                    <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}><span>Make sure to include the request ID when reporting a problem: {requestId}</span>
                    </div>
                </div>
                }
                <Animate show={loading} start={{opacity: 0.0}} enter={{opacity: [1.0], timing: {duration: 300}}}
                         leave={{opacity: [0.0], timing: {duration: 300}}}>
                    {s =>
                        <div className="loadingOverlay" style={{...s}}>
                            <div className="loading"/>
                        </div>
                    }
                </Animate>
                {previewImage &&
                <div className="preview">
                    <Preview key={regions.length}
                             maxWidth={document.body.clientWidth} maxHeight={Math.floor(window.innerHeight * 0.45)}
                             dotColor="#4C8F9F"
                             onSelectionChange={handlers.onSelectionChange} regions={regions}
                             initialRegion={initialRegion} image={previewImage}/>
                </div>
                }
                <div className="predicted-categories">
                    <PredictedCategories cs={categoryPredictions}/>
                </div>
                <CategoryFilter cats={filterOptions}/>

                <div className="wrapper">
                    <NodeGroup data={results}
                               keyAccessor={r => r.sku}
                               start={(r, i) => ({opacity: 0, translateX: -100})}
                               enter={(r, i) => ({
                                   opacity: [1],
                                   translateX: [0],
                                   timing: {delay: i * 100, duration: 300}
                               })}
                    >
                        {rs => <>{rs.map(({key, data, state}) => <Result
                            key={key}
                            noImageUrl={settings.noImageUrl}
                            template={settings.resultTemplate}
                            onImageClick={handlers.onImageClick}
                            onLinkClick={handlers.onLinkClick}
                            result={data}
                            style={{opacity: state.opacity, transform: `translateX(${state.translateX}%)`}}/>)}</>}
                    </NodeGroup>

                    {results.length === 0 && showPart === 'results' && !loading && (

                        <div className="noResults">We did not find anything <span role="img"
                                                                                  aria-label="sad face">😕</span></div>
                    )}

                    <br style={{clear: 'both'}}/>

                    {duration && showPart === 'results' && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                        took {duration.toFixed(2)} seconds</div>)}

                    {requestId && showPart === 'results' && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                </div>
            </section>

            <section className="footnote">
                <div className="wrapper">
                    © 2017 - 2019 <a href="https://nyris.io">nyris GmbH</a> - All rights reserved - <a
                    href="https://nyris.io/imprint/">Imprint</a>
                </div>
            </section>
            <Feedback feedbackState={feedbackState} onPositiveFeedback={handlers.onPositiveFeedback}
                      onNegativeFeedback={handlers.onNegativeFeedback} onClose={handlers.onCloseFeedback}/> }
        </div>
    );

};

function Copyright() {
    return (

        <Typography variant="body2" color="textSecondary" align="center">
            {'Powered by '}
            <Link color="inherit" href="https://nyris.io/" component='a'>
                nyris.io
            </Link>
            {' visual search.'}
        </Typography>
    );
}


const useStyles = makeStyles(theme => ({
    icon: {
        marginRight: theme.spacing(2),
    },
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
        transition: 'all 300ms',
        overflow: 'hidden',
        height: 500
    },
    heroContentClosed: {
        height: 0,
        padding: 0
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
        minHeight: 600,
        transition: 'all 300ms',
    },
    cardGridCollapsed: {
        height: 0,
        opacity: 0,
        minHeight: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
        backgroundSize: 'contain'
    },
    cardContent: {
        flexGrow: 1,
        paddingBottom: 0
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
    withElipsis: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    loading: {
        margin: theme.spacing(2),
    },
    fabContainer: {
        position: 'fixed',
        bottom: theme.spacing(2),

    },
    fab: {
        marginLeft: theme.spacing(2),
    },
}));

export const AppMD: React.FC<AppProps> = ({settings, handlers, showPart, previewImage, loading, search: {results, regions, initialRegion, requestId, duration}, mdSettings}) => {
    const classes = useStyles();
    return (
        <React.Fragment>
            <CssBaseline/>
            {showPart === 'camera' &&
            <Capture onCaptureComplete={handlers.onCaptureComplete} onCaptureCanceled={handlers.onCaptureCanceled}
                     onFileSelected={makeFileHandler(handlers.onSelectFile)} useAppText='Use default camera app'/>}
            <AppBar position={"relative"} style={{backgroundColor: mdSettings.appBarCustomBackgroundColor}}>

                <Container maxWidth='md' style={{flexDirection: 'row', display: 'flex'}}>
                    <img src={mdSettings.appBarLogoUrl} style={{height: '2em', minHeight: '64px', display: 'flex'}}/>
                    <Toolbar component="span">
                        <Typography style={{color: mdSettings.appBarCustomTextColor}}>
                            Page title (customizable)
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>

            <main>
                <div
                    className={classNames(classes.heroContent, showPart === 'results' ? classes.heroContentClosed : null)}>
                    <Container maxWidth='sm'>
                        <div>
                            <Hidden mdUp>
                                <div style={{textAlign: 'center'}}>
                                    <PhotoCamera style={{fontSize: '20em', color: '#cccccc'}}/>
                                </div>
                                <div style={{textAlign: 'center'}}>
                                    <Button variant={"contained"} color={"primary"} onClick={handlers.onCameraClick}>Take
                                        a
                                        picture</Button>
                                </div>
                                <div style={{textAlign: 'center'}}>
                                    <Typography>
                                        or
                                    </Typography>
                                </div>
                                <div style={{textAlign: 'center'}}>
                                    <input
                                        accept="image/*"
                                        id="raised-button-file"
                                        type="file"
                                        onChange={makeFileHandler(handlers.onSelectFile)}
                                        style={{width: '.1px', height: '.1px', overflow: 'hidden', opacity: 0}}
                                    />
                                    <label htmlFor="raised-button-file">
                                        <Button variant={"contained"} color={"primary"} component="span">
                                            Select an image
                                        </Button>
                                    </label>
                                </div>
                            </Hidden>
                            <Hidden smDown>
                                <div style={{border: 'dashed 5px #ddd', borderRadius: 10, padding: 10}}>
                                    <div style={{textAlign: 'center'}}>
                                        <Image style={{fontSize: '20em', color: '#cccccc'}}/>
                                    </div>
                                    <div style={{textAlign: 'center'}}>
                                        <Typography variant='body1'>
                                            DROP AN IMAGE
                                        </Typography>
                                    </div>
                                    <div style={{textAlign: 'center'}}>
                                        <Typography>
                                            or
                                        </Typography>
                                    </div>
                                    <div style={{textAlign: 'center'}}>
                                        <input
                                            accept="image/*"
                                            id="raised-button-file"
                                            type="file"
                                            onChange={makeFileHandler(handlers.onSelectFile)}
                                            style={{width: '.1px', height: '.1px', overflow: 'hidden', opacity: 0}}
                                        />
                                        <label htmlFor="raised-button-file">
                                            <Button variant={"contained"} color={"primary"} component="span">
                                                Select an image
                                            </Button>
                                        </label>
                                    </div>
                                </div>
                            </Hidden>
                        </div>
                    </Container>
                </div>
                <Container className={classNames(classes.cardGrid, showPart !== 'results' && classes.cardGridCollapsed)}
                           maxWidth="md">

                    {previewImage &&
                    <Card style={{marginBottom: '4em'}} raised={true}>
                        <Preview key={regions.length}
                                 maxWidth={document.body.clientWidth}
                                 maxHeight={Math.floor(window.innerHeight * 0.45)}
                                 dotColor={mdSettings.primaryColor}
                                 onSelectionChange={handlers.onSelectionChange} regions={regions}
                                 initialRegion={initialRegion} image={previewImage}/>
                    </Card>
                    }

                    {loading && <div style={{textAlign: 'center'}}>
                        <CircularProgress className={classes.loading}/>
                    </div>}

                    <Grid container spacing={4}>
                        <NodeGroup data={results}
                                   keyAccessor={r => r.position + r.sku}
                                   start={(r, i) => ({opacity: 0, translateX: -100})}
                                   enter={(r, i) => ({
                                       opacity: [1],
                                       translateX: [0],
                                       timing: {delay: i * 100, duration: 300}
                                   })}>
                            {rs =>
                                <>
                                    {rs.map(({key, data: result, state}) =>
                                        <Grid item key={key} xs={12} sm={4} md={3}>
                                            <Card className={classes.card} style={{
                                                opacity: state.opacity,
                                                position: 'relative',
                                                transform: `translateX(${state.translateX}%)`
                                            }}>
                                                <CardMedia
                                                    className={classes.cardMedia}
                                                    image={(result.img && result.img.url) || settings.noImageUrl}
                                                    title={result.title}
                                                />
                                                <CardContent className={classes.cardContent}>
                                                    <Typography gutterBottom variant="subtitle2" component="h5"
                                                                className={classes.withElipsis}>
                                                        {result[mdSettings.resultFirstRowProperty]}
                                                    </Typography>
                                                    <Typography variant="body2" className={classes.withElipsis}>
                                                        {result[mdSettings.resultSecondRowProperty]}
                                                    </Typography>
                                                </CardContent>
                                                {result.l &&
                                                <CardActions>
                                                    <Button style={{marginLeft: 'auto'}} size="small" color="primary"
                                                            onClick={() => handlers.onLinkClick(result.position, result.l)}
                                                            onAuxClick={() => handlers.onLinkClick(result.position, result.l)} >
                                                        {mdSettings.resultLinkText}
                                                    </Button>
                                                </CardActions>
                                                }
                                            </Card>
                                        </Grid>
                                    )}
                                </>
                            }

                        </NodeGroup>

                    </Grid>

                    {results.length === 0 && showPart === 'results' && !loading && (
                        <Typography variant="h3" align="center">We did not find anything</Typography>
                    )}


                </Container>
                {showPart !== 'start' &&
                <Container maxWidth='lg'>
                    <div className={classes.fabContainer}>
                        <Fab aria-label='back' className={classes.fab} color='primary' onClick={handlers.onShowStart}>
                            <ArrowBack/>
                        </Fab>
                    </div>
                </Container>
                }

            </main>

            <footer className={classes.footer}>

                <Typography variant="subtitle1" align="center" color="textSecondary">
                    {requestId && showPart === 'results' && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                </Typography>
                <Copyright/>
            </footer>
        </React.Fragment>
    );
};

export default App;
