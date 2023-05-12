import React, { useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Circle, Rect, Path } from "react-konva";
import { RectCoords, Region, getThumbSizeLongestEdge } from "@nyris/nyris-api";
import Konva from "konva";
import { NodeGroup } from "react-move";

type PreviewElem = "tl" | "tr" | "bl" | "br" | "rect";

/** Properties of the Preview Component. */
interface PreviewProps {
  /** A canvas to render as the image. */
  image: HTMLCanvasElement;
  /** Initial selection on the image, setting this, won't send a selection change event. */
  selection: RectCoords;
  /** List of regions to display on the image */
  regions: Region[];
  /** Handler for changed selection. */
  onSelectionChange?: (r: RectCoords) => void;
  /** Maximal width of the image to display in pixels. */
  maxWidth: number;
  /** Maximal height of the image to display in pixels. */
  maxHeight: number;
  /** Color of the dot, which is rendered center of not selected regions. */
  dotColor: string;
}

/** @internal State of the Preview component */
interface PreviewState {
  tlHover: boolean;
  trHover: boolean;
  blHover: boolean;
  brHover: boolean;
  dotHover: boolean;
  rectHover: boolean;
}

const getCursor = (state: PreviewState) => {
  if (state.dotHover) {
    return "pointer";
  }
  if (state.tlHover) {
    return "nw-resize";
  }
  if (state.trHover) {
    return "ne-resize";
  }
  if (state.blHover) {
    return "sw-resize";
  }
  if (state.brHover) {
    return "se-resize";
  }
  if (state.rectHover) {
    return "move";
  }
  return "default";
};

const calcNewRect = (
  { x1, x2, y1, y2 }: RectCoords,
  elem: PreviewElem,
  newX: number,
  newY: number,
  elemWidth: number,
  elemHeight: number
) => {
  switch (elem) {
    case "rect":
      return {
        x1: newX,
        y1: newY,
        x2: newX + elemWidth,
        y2: newY + elemHeight,
      };
    case "tl":
      return {
        x1: newX,
        y1: newY,
        x2,
        y2,
      };
    case "tr":
      return {
        x2: newX,
        y1: newY,
        x1,
        y2,
      };
    case "bl":
      return {
        x1: newX,
        y2: newY,
        x2,
        y1,
      };
    case "br":
      return {
        x2: newX,
        y2: newY,
        x1,
        y1,
      };
  }
};

function scaleToPreviewPixels(
  width: number,
  height: number,
  { x1, x2, y1, y2 }: RectCoords
) {
  return {
    x1: Math.max(x1 * width, 5),
    x2: Math.min(x2 * width, width - 5),
    y1: Math.max(y1 * height, 5),
    y2: Math.min(y2 * height, height - 5),
  };
}

/** The Preview component. */
const Preview = ({
  selection,
  image,
  maxWidth,
  maxHeight,
  onSelectionChange,
  regions,
  dotColor,
}: PreviewProps) => {
  let { w: width, h: height } = getThumbSizeLongestEdge(
    maxWidth,
    maxHeight,
    image.width,
    image.height
  );
  const { x1, y1, x2, y2 } = scaleToPreviewPixels(width, height, selection);
  let [minX, minY] = [100, 100];

  const handleDragBoundTl = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.max(Math.min(x, x2 - minX), 0),
      y: Math.max(Math.min(y, y2 - minY), 0),
    };
  };

  const handleDragBoundTr = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.min(Math.max(x, x1 + minX), width),
      y: Math.max(Math.min(y, y2 - minY), 0),
    };
  };

  const handleDragBoundBl = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.max(Math.min(x, x2 - minX), 0),
      y: Math.min(Math.max(y, y1 + minY), height),
    };
  };

  const handleDragBoundBr = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.min(Math.max(x, x1 + minX), width),
      y: Math.min(Math.max(y, y1 + minY), height),
    };
  };

  const handleDragBoundRect = ({ x, y }: { x: number; y: number }) => {
    let elemWidth = x2 - x1 + 5;
    let elemHeight = y2 - y1 + 5;
    return {
      x: Math.max(Math.min(x, width - elemWidth), 5),
      y: Math.max(Math.min(y, height - elemHeight), 5),
    };
  };

  const selectionRef = useRef<Konva.Rect>(null);
  const [state, replaceState] = useState<PreviewState>({
    tlHover: false,
    trHover: false,
    blHover: false,
    brHover: false,
    dotHover: false,
    rectHover: false,
  });

  const setState = (s: any) => {
    let o = {};
    Object.assign(o, state, s);
    replaceState(o as PreviewState);
  };

  const handleDragMove = (
    elem: PreviewElem,
    evt: Konva.KonvaEventObject<DragEvent>
  ) => {
    if (evt.target instanceof Konva.Stage) {
      return;
    }

    let { x: newX, y: newY } = evt.target.getAbsolutePosition();
    let { width: elemWidth, height: elemHeight } = evt.target.getSize();
    const newRect = calcNewRect(
      { x1, x2, y1, y2 },
      elem,
      newX,
      newY,
      elemWidth,
      elemHeight
    );
    let newState = {
      x1: newRect.x1 / width,
      x2: newRect.x2 / width,
      y1: newRect.y1 / height,
      y2: newRect.y2 / height,
    };
    notifySelection(newState);
  };

  // animate selection
  useEffect(() => {
    let speed = 40;
    if (!selectionRef.current) {
      return;
    }
    let a = new Konva.Animation((frame) => {
      if (!frame) {
        return;
      }
      if (!selectionRef.current) {
        return;
      }
      let angleDiff = (frame.time * speed) / 1000;
      selectionRef.current.dashOffset(-angleDiff);
    }, selectionRef.current.getLayer());
    a.start();

    return () => {
      a && a.stop();
    };
  }, [selectionRef]);

  const handleDragMoveRect = handleDragMove.bind(null, "rect");
  const handleDragMoveTl = handleDragMove.bind(null, "tl");
  const handleDragMoveTr = handleDragMove.bind(null, "tr");
  const handleDragMoveBl = handleDragMove.bind(null, "bl");
  const handleDragMoveBr = handleDragMove.bind(null, "br");

  const notifySelection = (r: RectCoords) => {
    if (onSelectionChange) {
      onSelectionChange(r);
    }
  };

  if (!image) {
    return null;
  }

  const dots = regions.map((region, i) => {
    let { x1, x2, y1, y2 } = region.normalizedRect;
    let x = width * ((x2 - x1) / 2 + x1);
    let y = height * ((y2 - y1) / 2 + y1);
    return {
      // get middle of box and map to pixels
      region,
      key: `${x}-${y}`,
      x,
      y,
    };
  });

  let gripSize = 20;
  let darkOpacity = 0.3;

  return (
    <Stage
      width={width}
      height={height}
      style={{
        cursor: getCursor(state),
        width: width,
        height: height,
        margin: "auto",
      }}
    >
      <Layer key="img">
        <Image image={image} width={width} height={height} />
      </Layer>
      <Layer key="selection">
        {/* Selection box */}
        <Rect
          stroke="white"
          opacity={0}
          strokeWidth={0}
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
        />
        <Rect
          stroke="black"
          draggable={true}
          onDragMove={handleDragMoveRect}
          dragBoundFunc={handleDragBoundRect}
          onMouseOver={() => setState({ rectHover: true })}
          onMouseOut={() => setState({ rectHover: false })}
          opacity={0}
          strokeWidth={2}
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
          dash={[0, 0]}
          ref={selectionRef}
        />

        {/* Dark areas */}
        <Rect
          fill="black"
          opacity={darkOpacity}
          x={0}
          y={0}
          width={width}
          height={y1}
        />
        <Rect
          fill="black"
          opacity={darkOpacity}
          x={0}
          y={y2}
          width={width}
          height={height - y2}
        />
        <Rect
          fill="black"
          opacity={darkOpacity}
          x={0}
          y={y1}
          width={x1}
          height={y2 - y1}
        />
        <Rect
          fill="black"
          opacity={darkOpacity}
          x={x2}
          y={y1}
          width={width - x2}
          height={y2 - y1}
        />
      </Layer>
      {/* grips */}
      <Layer>
        {/* top left */}
        <Path
          data="M2 18V10C2 5.58172 5.58172 2 10 2H18"
          stroke={"white"}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={1}
          x={x1 - 3}
          y={y1 - 3}
          shadowColor={"#000000"}
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 0 }}
          shadowOpacity={0.25}
        />
        <Rect
          draggable={true}
          onDragMove={handleDragMoveTl}
          dragBoundFunc={handleDragBoundTl}
          onMouseOver={() => setState({ tlHover: true })}
          onMouseOut={() => setState({ tlHover: false })}
          opacity={1}
          width={gripSize}
          height={gripSize}
          x={x1}
          y={y1}
        />
        {/* top right */}
        <Path
          data="M2 2L10 2C14.4183 2 18 5.58172 18 10L18 18"
          stroke={"white"}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={1}
          x={x2 + 3}
          y={y1 - 3}
          offsetX={gripSize}
          shadowColor={"#000000"}
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 0 }}
          shadowOpacity={0.25}
        />
        <Rect
          draggable={true}
          onDragMove={handleDragMoveTr}
          dragBoundFunc={handleDragBoundTr}
          onMouseOver={() => setState({ trHover: true })}
          onMouseOut={() => setState({ trHover: false })}
          opacity={1}
          width={gripSize}
          height={gripSize}
          x={x2}
          y={y1}
          offsetX={gripSize}
        />
        {/* bottom left */}
        <Path
          data="M18 18L10 18C5.58172 18 2 14.4183 2 10L2 2"
          stroke={"white"}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={1}
          x={x1 - 3}
          y={y2 + 3}
          offsetY={gripSize}
          shadowColor={"#000000"}
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 0 }}
          shadowOpacity={0.25}
        />
        <Rect
          draggable={true}
          onDragMove={handleDragMoveBl}
          dragBoundFunc={handleDragBoundBl}
          onMouseOver={() => setState({ blHover: true })}
          onMouseOut={() => setState({ blHover: false })}
          opacity={1}
          width={gripSize}
          height={gripSize}
          x={x1}
          y={y2}
          offsetY={gripSize}
        />
        {/* bottom right */}
        <Path
          data="M18 2L18 10C18 14.4183 14.4183 18 10 18L2 18"
          stroke={"white"}
          strokeWidth={5}
          strokeLinecap="round"
          x={x2 + 3}
          y={y2 + 3}
          opacity={1}
          offsetY={gripSize}
          offsetX={gripSize}
          shadowColor={"#000000"}
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 0 }}
          shadowOpacity={0.25}
        />
        <Rect
          opacity={1}
          draggable={true}
          onDragMove={handleDragMoveBr}
          dragBoundFunc={handleDragBoundBr}
          onMouseOver={() => setState({ brHover: true })}
          onMouseOut={() => setState({ brHover: false })}
          x={x2}
          y={y2}
          width={gripSize}
          height={gripSize}
          offsetY={gripSize}
          offsetX={gripSize}
        />
      </Layer>

      <NodeGroup
        data={dots}
        keyAccessor={(r) => r.key}
        start={(d, i) => ({ opacity: 0, x: -100, y: d.y })}
        enter={(d, i) => ({
          opacity: [1],
          x: [d.x],
          y: d.y,
          timing: { delay: i * 100, duration: 300 },
        })}
      >
        {(ds) => (
          <Layer key="dots">
            {ds.map(({ key, data, state: position }) => (
              <Circle
                onClick={() => {
                  notifySelection(data.region.normalizedRect);
                  setState({ dotHover: false });
                }}
                onTap={() => {
                  notifySelection(data.region.normalizedRect);
                  setState({ dotHover: false });
                }}
                onMouseOver={() => setState({ dotHover: true })}
                onMouseOut={() => setState({ dotHover: false })}
                key={key}
                radius={7}
                {...position}
                stroke={dotColor}
                fill="white"
                strokeWidth={5}
              />
            ))}
          </Layer>
        )}
      </NodeGroup>
    </Stage>
  );
};

export default Preview;
