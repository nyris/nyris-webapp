import './App.css';
import React from 'react';
import Result from './components/Result';
import Preview from './components/Preview';
import ExampleImages from './components/ExampleImages';
import Feedback from './components/Feedback';
import CategoryFilter from "./components/CategoryFilter";
import PredictedCategories from "./components/PredictedCategories";
import {useDropzone} from "react-dropzone";
import classNames from 'classnames';
import {Animate, NodeGroup} from "react-move";
import {Region} from "./types";
import {NyrisAppPart, NyrisFeedbackState} from "./actions/nyrisAppActions";
import Capture from "./components/Capture";
import {
    AppBar,
    Button, Card, CardActions, CardContent,
    CardMedia,
    Container,
    CssBaseline,
    Grid,
    Link,
    makeStyles,
    Toolbar,
    Typography
} from "@material-ui/core";
import {PhotoCamera} from "@material-ui/icons";


const makeFileHandler = (action: any) => (e: any) => {
    let file = (e.dataTransfer && e.dataTransfer.files[0]) || e.target.files[0];
    action(file);
};


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
    handlers: any
}

const App: React.FC<AppProps> = ({
                                     search: {results, regions, initialRegion, requestId, duration, errorMessage, filterOptions, categoryPredictions},
                                     showPart, settings, handlers, loading, previewImage, feedbackState
                                 }) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop: handlers.onFileDropped});
    return (
        <div>
            {showPart === 'camera' &&
            <Capture onCaptureComplete={handlers.onCaptureComplete} onCaptureCanceled={handlers.onCaptureCanceled}
                     onFileSelected={handlers.onSelectFile} useAppText='Use default camera app'/>}
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
                        <ExampleImages images={settings.exampleImages} onExampleImageClicked={handlers.onImageClick}/>
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

                {duration && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                    took {duration.toFixed(2)} seconds</div>)}

                {requestId && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                    identifier {requestId}</div>}
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
            <Link color="inherit" href="https://nyris.io/">
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
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));
const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const AppMD: React.FC<AppProps> = ({handlers, showPart, previewImage, search: {regions, initialRegion, requestId, duration}}) => {
    const classes = useStyles();
    return (
        <React.Fragment>
            <CssBaseline/>
            {showPart === 'camera' &&
            <Capture onCaptureComplete={handlers.onCaptureComplete} onCaptureCanceled={handlers.onCaptureCanceled}
                     onFileSelected={handlers.onSelectFile} useAppText='Use default camera app'/>}
            <AppBar position={"relative"}>

                <Container maxWidth='md'>
                    <Toolbar>
                        <img src='images/testlogo.jpg' style={{height: '2em', marginRight: '2em'}}/>
                        <Typography>
                            Product search (customizable)
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>

            <main>
                <div className={classes.heroContent}>
                    <Container maxWidth='sm'>
                        <div>
                            <div style={{textAlign: 'center'}}>
                                <PhotoCamera style={{fontSize: '20em', color: '#cccccc'}}/>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <Button variant={"contained"} color={"primary"} onClick={handlers.onCameraClick}>Take a
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
                        </div>
                    </Container>
                </div>
                <Container className={classes.cardGrid} maxWidth="md">

                    {previewImage &&
                    <Card style={{marginBottom: '4em'}} raised={true}>
                        <div className="preview" style={{textAlign: "center"}}>
                            <Preview key={regions.length}
                                     maxWidth={document.body.clientWidth}
                                     maxHeight={Math.floor(window.innerHeight * 0.45)}
                                     dotColor="#4C8F9F"
                                     onSelectionChange={handlers.onSelectionChange} regions={regions}
                                     initialRegion={initialRegion} image={previewImage}/>
                        </div>
                    </Card>
                    }

                    <Grid container spacing={4}>
                        {cards.map(card => (
                            <Grid item key={card} xs={12} sm={6} md={4}>
                                <Card className={classes.card}>
                                    <CardMedia
                                        className={classes.cardMedia}
                                        image="https://source.unsplash.com/random"
                                        title="Image title"
                                    />
                                    <CardContent className={classes.cardContent}>
                                        <Typography gutterBottom variant="h5" component="h5">
                                            Title (custom)
                                        </Typography>
                                        <Typography>
                                            1234abc (SKU custom)
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button style={{marginLeft: 'auto'}} size="small" color="primary">
                                            Link (custom)
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

            </main>

            <footer className={classes.footer}>
                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    {duration && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                        took {duration.toFixed(2)} seconds</div>)}
                </Typography>

                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    {requestId && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                </Typography>
                <Copyright/>
            </footer>
        </React.Fragment>
    );
};

export default App;
