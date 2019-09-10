import React from 'react';
import {Layer, Stage, Image, Rect, Circle} from "react-konva";
import {Region, RegionResult} from "../types";
import Konva from 'konva';
import {NodeGroup} from "react-move";
import {getThumbSizeLongestEdge} from "../nyris";


type PreviewElem =
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br'
    | 'rect';

interface PreviewProps {
    image: HTMLCanvasElement,
    initialRegion: Region,
    regions: RegionResult[],
    onSelectionChange?: (r: Selection) => void,
    maxWidth: number,
    maxHeight: number,
    dotColor: string
}

interface Selection {
    x1: number,
    x2: number,
    y1: number,
    y2: number,
}

interface PreviewState extends Selection {
    tlHover: boolean,
    trHover: boolean,
    blHover: boolean,
    brHover: boolean,
    dotHover: boolean,
    rectHover: boolean
}

class Preview extends React.Component<PreviewProps,PreviewState> {
    private readonly selectionRef: React.RefObject<any>;
    private animation?: Konva.Animation;

    private handleDragMoveRect = this.handleDragMove.bind(this, 'rect');
    private handleDragMoveTl = this.handleDragMove.bind(this, 'tl');
    private handleDragMoveTr = this.handleDragMove.bind(this, 'tr');
    private handleDragMoveBl = this.handleDragMove.bind(this, 'bl');
    private handleDragMoveBr = this.handleDragMove.bind(this, 'br');

    private handleDragBoundTl = ({x, y}: {x: number,y: number}) => {
        let [minX, minY ] = [ 100, 100];
        let {x2, y2} = this.scaleToPreviewPixels(this.state);
        return {
            x: Math.max(Math.min(x, x2-minX), 0),
            y: Math.max(Math.min(y, y2-minY), 0)

        };
    };

    private handleDragBoundTr = ({x, y}: {x: number,y: number}) => {
        let [minX, minY ] = [ 100, 100];
        let {x1, y2, width} = this.scaleToPreviewPixels(this.state);
        return {
            x: Math.min(Math.max(x, x1+minX), width),
            y: Math.max(Math.min(y, y2-minY), 0)

        };
    }
    private handleDragBoundBl = ({x, y}: {x: number,y: number}) => {
        let [minX, minY ] = [ 100, 100];
        let { x2, y1, height} = this.scaleToPreviewPixels(this.state);
        return {
            x: Math.max(Math.min(x, x2-minX), 0),
            y: Math.min(Math.max(y, y1+minY), height)
        };
    };

    private handleDragBoundBr = ({x, y}: {x: number,y: number}) => {
        let [minX, minY ] = [ 100, 100];
        let {x1, y1, width, height} = this.scaleToPreviewPixels(this.state);
        return {
            x: Math.min(Math.max(x, x1+minX), width),
            y: Math.min(Math.max(y, y1+minY), height)
        };
    };

    private handleDragBoundRect = ({x, y}: {x: number,y: number}) => {
        let {x1, x2, y1, y2, width, height} = this.scaleToPreviewPixels(this.state);
        let elemWidth = x2-x1;
        let elemHeight = y2-y1;
        return {
            x: Math.max(Math.min(x, width-elemWidth), 0),
            y: Math.max(Math.min(y, height-elemHeight), 0)
        };
    };

    private handleSelectionChanged(selection: Selection) {
        this.setState(selection);
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(selection);
        }
    }

    constructor(props: PreviewProps) {
        super(props);
        this.selectionRef = React.createRef<Konva.Shape>();
        let { top, left, right, bottom } = props.initialRegion;
        console.log('constr', props.initialRegion);
        this.state = {
            tlHover: false,
            trHover: false,
            blHover: false,
            brHover: false,
            dotHover: false,
            rectHover: false,
            x1: left,
            x2: 1-right,
            y1: top,
            y2: 1-bottom
        };
    }

    private handleDragMove(elem: PreviewElem, evt: Konva.KonvaEventObject<DragEvent>) {
        let {x1, x2, y1, y2, width, height} = this.scaleToPreviewPixels(this.state);
        if (evt.target instanceof Konva.Stage) {
            return;
        }

        let {x: newX, y: newY} = evt.target.getAbsolutePosition();
        let {width: elemWidth, height: elemHeight} = evt.target.getSize();
        switch (elem) {
            case 'rect':
                x1=newX;
                y1=newY;
                x2=newX+elemWidth;
                y2=newY+elemHeight;
                break;
            case 'tl':
                x1=newX;
                y1=newY;
                break;
            case 'tr':
                x2=newX;
                y1=newY;
                break;
            case 'bl':
                x1=newX;
                y2=newY;
                break;
            case 'br':
                x2=newX;
                y2=newY;
                break;
        }
        let newState = {
            x1: x1/width,
            x2: x2/width,
            y1: y1/height,
            y2: y2/height
        };
        this.setSelection(newState);
    }

    private scaleToPreviewPixels({x1, x2, y1, y2} : Selection) {
        let { w: width, h: height } = getThumbSizeLongestEdge(this.props.maxWidth, this.props.maxHeight, this.props.image.width, this.props.image.height);
        return {
            x1: x1*width,
            x2: x2*width,
            y1: y1*height,
            y2: y2*height,
            width,
            height
        };
    }


    componentDidMount(): void {
        let speed = 40;
        this.animation = new Konva.Animation((frame: {timeDiff: number, time: number}) => {
            let angleDiff = (frame.time * speed) / 1000;
            this.selectionRef.current.dashOffset(-angleDiff);
        }, this.selectionRef.current.getLayer());
        this.animation.start();
    }

    componentWillUnmount(): void {
        this.animation && this.animation.stop();
    }

    setSelection(r: Region | Selection) { // TODO what is better here?
        if ('left' in r) {
            this.handleSelectionChanged({
                x1: r.left, x2: r.right, y1: r.top, y2: r.bottom
            });
        }
        if ('x1' in r) {
            this.handleSelectionChanged(r);
        }
    }

    getCursor() {
        if (this.state.dotHover) {
            return 'pointer';
        }
        if (this.state.tlHover) {
            return 'nw-resize';
        }
        if (this.state.trHover) {
            return 'ne-resize';
        }
        if (this.state.blHover) {
            return 'sw-resize';
        }
        if (this.state.brHover) {
            return 'se-resize';
        }
        if (this.state.rectHover) {
            return 'move';
        }
        return 'default';
    }



    render() {
        const {image, regions} = this.props;
        if (!image) {
            return null;
        }

        const {x1, x2, y1, y2 , width, height } = this.scaleToPreviewPixels(this.state);
        //let { w: width, h: height } = getThumbSizeLongestEdge(this.props.maxWidth, this.props.maxHeight, image.width, image.height);

        const dots = regions.map(({region}, i) => {
            let {left, right, top, bottom} = region;
            return {
                region,
                x: width* ((right-left)/2 + left),
                y: height* ((bottom-top)/2+ top),
                key: i
            };
        });

        let gripSize = 40;
        let gripOpacity = 0.3;
        let gripOpacityOver = 0.6;
        let darkOpacity = 0.3;


        return (
            <Stage width={width} height={height} style={{cursor: this.getCursor(), width: width, height: height, margin: 'auto'}}>
                <Layer key='img'>
                    <Image image={image} width={width} height={height}/>
                </Layer>
                <Layer key='selection'>
                    {/* Selection box */}
                    <Rect stroke='white' strokeWidth={2} x={x1} y={y1} width={x2-x1} height={y2-y1} />
                    <Rect stroke='black' draggable={true} onDragMove={this.handleDragMoveRect} dragBoundFunc={this.handleDragBoundRect}
                          onMouseOver={() => this.setState({rectHover: true})}
                          onMouseOut={() => this.setState({rectHover: false})}
                          opacity={0.8} strokeWidth={2} x={x1} y={y1} width={x2-x1} height={y2-y1} dash={[15, 15]} ref={this.selectionRef} />
                    {/* grips */}
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMoveTl} dragBoundFunc={this.handleDragBoundTl}
                          onMouseOver={() => this.setState({tlHover: true})} onMouseOut={() => this.setState({tlHover: false})} opacity={this.state.tlHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x1} y={y1} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMoveTr} dragBoundFunc={this.handleDragBoundTr}
                          onMouseOver={() => this.setState({trHover: true})} onMouseOut={() => this.setState({trHover: false})} opacity={this.state.trHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x2} y={y1} offsetX={gripSize} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMoveBl} dragBoundFunc={this.handleDragBoundBl}
                          onMouseOver={() => this.setState({blHover: true})} onMouseOut={() => this.setState({blHover: false})} opacity={this.state.blHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x1} y={y2} offsetY={gripSize} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMoveBr} dragBoundFunc={this.handleDragBoundBr}
                          onMouseOver={() => this.setState({brHover: true})} onMouseOut={() => this.setState({brHover: false})} opacity={this.state.brHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x2} y={y2} offsetY={gripSize} offsetX={gripSize} />
                    {/* Dark areas */}
                    <Rect fill='black' opacity={darkOpacity} x={0} y={0} width={width} height={y1} />
                    <Rect fill='black' opacity={darkOpacity} x={0} y={y2} width={width} height={height-y2} />
                    <Rect fill='black' opacity={darkOpacity} x={0} y={y1} width={x1} height={y2-y1} />
                    <Rect fill='black' opacity={darkOpacity} x={x2} y={y1} width={width - x2} height={y2-y1} />
                </Layer>
                <NodeGroup data={dots}
                           keyAccessor={r => r.key}
                           start={(d, i) => ({opacity: 0, x: -100, y: d.y})}
                           enter={(d, i) => ({opacity: [1], x: [d.x], y: d.y, timing: {delay: i*100, duration: 300}})}>
                    {ds => <Layer key='dots'>{ds.map(({key, data, state: position}) =>
                        <Circle onClick={() => this.setSelection(data.region)}
                                onMouseOver={() => this.setState({dotHover: true})}
                                onMouseOut={() => this.setState({dotHover: false})}
                                key={key} radius={7} {...position} stroke={this.props.dotColor} fill="white" strokeWidth={4}/>)}</Layer>}
                </NodeGroup>
            </Stage>
        );
    }
}

export default Preview;
