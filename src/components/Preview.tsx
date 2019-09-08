import React from 'react';
import {Layer, Stage, Image, Rect, Group, Circle} from "react-konva";
import {Region, RegionResult} from "../types";
import Konva from 'konva';
import {NodeGroup} from "react-move";

/*
@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
    @ViewChild('previewCanvas', {static: false}) previewCanvas : ElementRef;

    @Input() visible: boolean = false;
    @Input() dots: Dot[] = [];

    private selectionChangedEmitter = new EventEmitter<Rect>();
    private mouseMovedEmitter = new EventEmitter<{inside: boolean}>();
    private selectionUpdateSampler = merge(
        this.selectionChangedEmitter.pipe(debounceTime(600)),
        this.mouseMovedEmitter.pipe(
            distinctUntilChanged((e1, e2) =>e1.inside == e2.inside),
            filter(e => e.inside == false)
        )
    );

    @Output() selectionChanged = this.selectionChangedEmitter.pipe(
        sample(this.selectionUpdateSampler),
        filter(_ => this.selectedElement == '')
    );

    selection?: Rect = {x:0, y: 0, x2:0, y2: 0};
    displaySelection?: Rect = {x:0, y: 0, x2:0, y2: 0};
    rectOffset = [0, 0];
    rectDim = [0, 0];

    minX = 90;
    minY = 90;
    previewHeightRatio = 0.45; // hight of the preview compared to window height

    selectedElement = '';

    width: number;
    height: number;
    offsetLeft: number;

    constructor(public settings: DemoSettingsService) {
    }

    ngOnInit() {
        this.updateDimensions();
    }


    @HostListener('document:mouseup')
    selectionUp() {
        if (this.selectedElement == '') {
            return;
        }
        this.selectedElement = '';
        this.selection = this.orientSelection(this.selection);
        // resize to minimal size
        let [w, h] = [
            Math.abs(this.selection.x-this.selection.x2),
            Math.abs(this.selection.y-this.selection.y2)
        ];
        let [dW, dH ] = [
            this.minX - w,
            this.minY - h
        ];
        if (w< this.minX) {
            this.selection.x2 = Math.min(this.width, this.selection.x2+dW/2);
            dW = this.minX - Math.abs(this.selection.x-this.selection.x2);
            this.selection.x = Math.max(0, this.selection.x-dW);
            dW = this.minX - Math.abs(this.selection.x-this.selection.x2);
            this.selection.x2 = Math.min(this.width, this.selection.x2+dW);
        }
        if (h< this.minY) {
            this.selection.y2 = Math.min(this.height, this.selection.y2+dH/2);
            dH = this.minY - Math.abs(this.selection.y-this.selection.y2);
            this.selection.y = Math.max(0, this.selection.y-dH);
            dH = this.minY - Math.abs(this.selection.y-this.selection.y2);
            this.selection.y2 = Math.min(this.height, this.selection.y2+dH);
        }
        if (Math.abs(this.selection.x-this.selection.x2)>10 && Math.abs(this.selection.y - this.selection.y2)> 10) {
            this.selection = this.orientSelection(this.selection);
            this.selectionChangedEmitter.emit(this.selection);
        }
        this.displaySelection = this.orientSelection(this.selection);
    }


    @HostListener('document:mousemove', ['$event'])
    selectionMove(evt: MouseEvent | TouchEvent) {
        let [px, py] = [(<MouseEvent>evt).clientX || (<TouchEvent>evt).touches[0].clientX, (<MouseEvent>evt).clientY || (<TouchEvent>evt).touches[0].clientY];


            let rect = this.previewCanvas.nativeElement.getBoundingClientRect();
            let [sx, sy] = [ px - rect.left, py - rect.top ]; // position on canvas
            let [rx, ry] = this.rectOffset;
            let [rw, rh] = this.rectDim;

            let padding = 20;
            this.mouseMovedEmitter.emit({inside: sx > -padding && sy > -padding && sx < this.width + padding && sy <this.height + padding});

            switch (this.selectedElement) {
                case 'init':
                this.selection.x2=Math.max(Math.min(sx, this.width), 0);
                this.selection.y2=Math.max(Math.min(sy, this.height), 0);
                break;
                case 'rect':
                this.selection.x=Math.max(Math.min(sx-rx, this.width-rw), 0);
                this.selection.y=Math.max(Math.min(sy-ry, this.height-rh), 0);
                this.selection.x2=Math.min(Math.max(sx-rx+rw, rw), this.width);
                this.selection.y2=Math.min(Math.max(sy-ry+rh, rh), this.height);
                break;
                case 'tl':
                this.selection.x=Math.max(Math.min(sx-rx, this.selection.x2-this.minX), 0);
                this.selection.y=Math.max(Math.min(sy-ry, this.selection.y2-this.minY), 0);
                break;
                case 'tr':
                this.selection.x2=Math.min(Math.max(sx+rw-rx, this.selection.x+this.minX), this.width);
                this.selection.y=Math.max(Math.min(sy-ry, this.selection.y2-this.minY), 0);
                break;
                case 'bl':
                this.selection.x=Math.max(Math.min(sx-rx, this.selection.x2-this.minX), 0);
                this.selection.y2=Math.min(Math.max(sy +rh-ry, this.selection.y+this.minY), this.height);
                break;
                case 'br':
                this.selection.x2=Math.min(Math.max(sx+rw-rx, this.selection.x+this.minX), this.width);
                this.selection.y2=Math.min(Math.max(sy +rh-ry, this.selection.y+this.minY), this.height);
                break;
            }
            this.displaySelection = this.orientSelection(this.selection);
            }

            // noinspection JSMethodCanBeStatic
            orientSelection(r: Rect) : Rect {
                return {
                x: r.x > r.x2 ? r.x2 : r.x,
                x2: r.x > r.x2 ? r.x : r.x2,
                y: r.y > r.y2 ? r.y2 : r.y,
                y2: r.y > r.y2 ? r.y : r.y2,
            }

            }




            async setPreview(elem) {
                let [w, h] = getElementSize(elem);
                let maxHeight = Math.floor(window.innerHeight * this.previewHeightRatio);
                let newSize = getThumbSizeLongestEdge(document.body.clientWidth, maxHeight, w, h);
                toCanvas(elem, newSize, this.previewCanvas.nativeElement);
                setTimeout(() => {
                this.updateDimensions();
            }, 10)
            }

            selectionDown(elem, evt) {
                console.warn('elem', elem);
                evt.stopPropagation();
                evt.preventDefault();
                let [sx, sy] = [evt.clientX || evt.touches[0].clientX, evt.clientY || evt.touches[0].clientY];
                this.selectedElement = elem;
                let rectR = evt.target.getBoundingClientRect();
                this.rectOffset = [ sx - rectR.left, sy-rectR.top ];
                this.rectDim = [ rectR.width, rectR.height];
                if (elem == '') {
                let rect = this.previewCanvas.nativeElement.getBoundingClientRect();
                let [ex, ey] = [sx-rect.left, sy-rect.top];
                this.selection.x = ex;
                this.selection.y = ey;
                this.selection.x2 = ex;
                this.selection.y2 = ey;
                this.selectedElement = 'init';
            }

            }

            async dotClicked(evt, dot) {
                evt.preventDefault();
                evt.stopPropagation();
                this.selection = JSON.parse(JSON.stringify(dot.selection));
                this.displaySelection = this.selection;
                this.selectionChangedEmitter.emit(this.selection);
            }

            updateDimensions() {
                this.width = this.previewCanvas.nativeElement.width;
                this.height = this.previewCanvas.nativeElement.height;
                this.offsetLeft = this.previewCanvas.nativeElement.offsetLeft;
            }

            setSelection(r: Rect, fireEvent = true) {
                this.selection = r;
                this.displaySelection = r;
                if (fireEvent)
                this.selectionChangedEmitter.emit(r);
            }

            noop(evt) {
                evt.stopPropagation();
            }

            }
*/


// TODO
/*
         (touchstart)="selectionDown('', $event)"
         (touchmove)="selectionMove($event)"
         (touchend)="selectionUp()"
         (mousedown)="selectionDown('', $event)"
         (mousemove)="selectionMove($event)"
         (mouseup)="selectionUp()"

(click)="dotClicked($event, dot)" (mousedown)="noop($event)" (mouseup)="noop($event)" (touchstart)="noop($event)" touchend="noop($event)"

(touchstart)="selectionDown('rect', $event)" (mousedown)="selectionDown('rect', $event)"

(touchstart)="selectionDown('tl', $event)" (mousedown)="selectionDown('tl', $event)"
(touchstart)="selectionDown('tr', $event)" (mousedown)="selectionDown('tr', $event)"
(touchstart)="selectionDown('bl', $event)" (mousedown)="selectionDown('bl', $event)"
(touchstart)="selectionDown('br', $event)" (mousedown)="selectionDown('br', $event)"


 */

type PreviewElem =
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br'
    | 'rect';

interface PreviewProps {
    image: HTMLCanvasElement,
    displaySelection: Region,
    regions: RegionResult[]
}

interface PreviewState {
    tlHover: boolean,
    trHover: boolean,
    blHover: boolean,
    brHover: boolean,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    initialRegion: Region
}

class Preview extends React.Component<PreviewProps,PreviewState> {
    private readonly selectionRef: React.RefObject<any>;
    private animation?: Konva.Animation;

    constructor(props: PreviewProps) {
        super(props);
        this.selectionRef = React.createRef<Konva.Shape>();
        this.state = {
            tlHover: false,
            trHover: false,
            blHover: false,
            brHover: false,
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 1,
            initialRegion: props.displaySelection
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

    handleDragMove(elem: PreviewElem, evt: Konva.KonvaEventObject<DragEvent>) {
        let [minX, minY ] = [ 50, 50];
        console.log('handledrag', evt.target, elem)
        let { width, height } = this.props.image;
        let {x1, x2, y1, y2} = this.scaleToImg(this.props.image, this.state);
        if (evt.target instanceof Konva.Stage) {
            return;
        }

        let {x: newX, y: newY} = evt.target.getAbsolutePosition();
        let {width: elemWidth, height: elemHeight} = evt.target.getSize();
        switch (elem) {

            case 'rect':
                x1=Math.max(Math.min(newX, width), 0);
                y1=Math.max(Math.min(newY, height), 0);
                x2=Math.min(Math.max(newX, 0), width);
                y2=Math.min(Math.max(newY, 0), height);

                x1=Math.max(Math.min(newX, width-elemWidth), 0);
                y1=Math.max(Math.min(newY, height-elemHeight), 0);
                x2=Math.min(Math.max(newX+elemWidth, elemWidth), width);
                y2=Math.min(Math.max(newY+elemHeight, elemHeight), height);

                break;
            case 'tl':
                x1=Math.max(Math.min(newX, x2-minX), 0);
                y1=Math.max(Math.min(newY, y2-minY), 0);
                break;
            case 'tr':
                x2=Math.min(Math.max(newX, x1+minX), width);
                y1=Math.max(Math.min(newY, y2-minY), 0);
                break;
            case 'bl':
                x1=Math.max(Math.min(newX, x2-minX), 0);
                y2=Math.min(Math.max(newY, y1+minY), height);
                break;
            case 'br':
                x2=Math.min(Math.max(newX, x1+minX), width);
                y2=Math.min(Math.max(newY, y1+minY), height);
                break;

        }
        console.log('state', {newX, newY, x1, x2, y1,y2})
        this.setState({
            x1: x1/width,
            x2: x2/width,
            y1: y1/height,
            y2: y2/height
        });
    }

    scaleToImg({width, height}: {width: number, height: number}, {x1, x2, y1, y2} : { x1: number, x2: number, y1: number, y2:number}) {
        return {
            x1: x1*width,
            x2: x2*width,
            y1: y1*width,
            y2: y2*width
        };
    }

    static getDerivedStateFromProps(props: PreviewProps, state: PreviewState) {
        return null;
    }



    render() {
        const {image, regions, displaySelection} = this.props;
        if (!image) {
            return null;
        }
        const dots = regions.map(({region: {left, right, top, bottom}}, i) => ({
            x: image.width* ((right-left)/2 + left),
            y: image.height* ((bottom-top)/2+ top),
            key: i
        }));

        const {x1, x2, y1, y2} = this.scaleToImg(image, this.state);

        let gripSize = 40;
        let gripOpacity = 0.3;
        let gripOpacityOver = 0.6;
        let darkOpacity = 0.3;

        return (<div className="preview">
            <Stage width={image.width} height={image.height}>
                <Layer key='img'>
                    <Image image={image}/>
                </Layer>
                <Layer key='selection'>
                    {/* Selection box */}
                    <Rect stroke='white' strokeWidth={2} x={x1} y={y1} width={x2-x1} height={y2-y1} />
                    <Rect stroke='black' draggable={true} onDragMove={this.handleDragMove.bind(this, 'rect')}  opacity={0.8} strokeWidth={2} x={x1} y={y1} width={x2-x1} height={y2-y1} dash={[15, 15]} ref={this.selectionRef} />
                    {/* grips */}
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMove.bind(this, 'tl')}
                          onMouseOver={() => this.setState({tlHover: true})} onMouseOut={() => this.setState({tlHover: false})} opacity={this.state.tlHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x1} y={y1} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMove.bind(this, 'tr')}
                          onMouseOver={() => this.setState({trHover: true})} onMouseOut={() => this.setState({trHover: false})} opacity={this.state.trHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x2} y={y1} offsetX={gripSize} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMove.bind(this, 'bl')}
                          onMouseOver={() => this.setState({blHover: true})} onMouseOut={() => this.setState({blHover: false})} opacity={this.state.blHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x1} y={y2} offsetY={gripSize} />
                    <Rect fill='black' draggable={true} onDragMove={this.handleDragMove.bind(this, 'br')}
                          onMouseOver={() => this.setState({brHover: true})} onMouseOut={() => this.setState({brHover: false})} opacity={this.state.brHover ?  gripOpacityOver : gripOpacity} width={gripSize} height={gripSize} x={x2} y={y2} offsetY={gripSize} offsetX={gripSize} />
                    {/* Dark areas */}
                    <Rect fill='black' opacity={darkOpacity} x={0} y={0} width={image.width} height={y1} />
                    <Rect fill='black' opacity={darkOpacity} x={0} y={y2} width={image.width} height={image.height-y2} />
                    <Rect fill='black' opacity={darkOpacity} x={0} y={y1} width={x1} height={y2-y1} />
                    <Rect fill='black' opacity={darkOpacity} x={x2} y={y1} width={image.width - x2} height={y2-y1} />
                </Layer>
                <NodeGroup data={dots}
                           keyAccessor={r => r.key}
                           start={(d, i) => ({opacity: 0, x: -100, y: d.y})}
                           enter={(d, i) => ({opacity: [1], x: [d.x], y: d.y, timing: {delay: i*100, duration: 300}})}
                >
                    {ds => <Layer key='dots'>{ds.map(({key, data, state: position}) => <Circle key={key} radius={7} {...position} stroke="#4C8F9F" fill="white" strokeWidth={4}/>)}</Layer>}
                </NodeGroup>
            </Stage>
            </div>

        );
    }
    /*

    render() {
        const props = this.props || {};
        const canvas = this.canvasRef.current || {};

        return (
<div className="preview" style={{position: 'relative', margin: 'auto'}}>
<div style={{margin: 'auto', textAlign: 'center', width: props.width + 'px'}}>
<div className="previewOverlay" style={{
    width: props.width + 'px',
    height: props.height + 'px',
    overflow: 'hidden',
    position: 'absolute'
}}>
{props.dots && props.dots.length && renderDots(props.dots, true)}
<div className="selection_mask"
style={{top: 0, left: 0, width: '100%', height: props.displaySelection.y + 'px'}}/>
<div className="selection_mask" style={{
    top: props.displaySelection.y2 + 'px',
    left: 0,
    width: '100%',
    height: canvas.height - props.displaySelection.y2 + 'px'
}}/>
<div className="selection_mask" style={{
    top: props.displaySelection.y + 'px',
    left: 0,
    width: props.displaySelection.x + 'px',
    height: props.displaySelection.y2 - props.displaySelection.y + 'px'
}}/>
<div className="selection_mask" style={{
    top: props.displaySelection.y + 'px',
    left: props.displaySelection.x2 + 'px',
    width: canvas.width - props.displaySelection.x2 + 'px',
    height: props.displaySelection.y2 - props.displaySelection.y + 'px'
}}/>
<div className="selection_rect" style={{
    top: props.displaySelection.y + 'px',
    left: props.displaySelection.x + 'px',
    width: props.displaySelection.x2 - props.displaySelection.x + 'px',
    height: props.displaySelection.y2 - props.displaySelection.y + 'px'
}}/>
{
    props.selectedElement !== 'init' ? (
        <div className="selection_grip tl"
             style={{top: props.displaySelection.y + 'px', left: props.displaySelection.x + 'px'}}/>
    ) : null
}

{
    props.selectedElement !== 'init' ? (
        <div className="selection_grip tr" style={{
            top: props.displaySelection.y + 'px',
            left: props.displaySelection.x2 - 40 + 'px'
        }}/>
    ) : null
}
{
    props.selectedElement !== 'init' ? (
        <div className="selection_grip bl" style={{
            top: props.displaySelection.y2 - 40 + 'px',
            left: props.displaySelection.x + 'px'
        }}/>
    ) : null
}
{
    props.selectedElement !== 'init' ? (
        <div className="selection_grip br" style={{
            top: props.displaySelection.y2 - 40 + 'px',
            left: props.displaySelection.x2 - 40 + 'px'
        }}/>
    ) : null
}
</div>
<canvas id="preview" ref={this.canvasRef}/>
</div>
</div>)

};

     */



}

export default Preview;
