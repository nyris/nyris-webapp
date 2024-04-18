import React, { useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Circle, Rect, Path } from "react-konva";
import { RectCoords, Region, getThumbSizeLongestEdge } from "@nyris/nyris-api";
import Konva from "konva";
import { NodeGroup } from "react-move";

type PreviewElem = "tl" | "tr" | "bl" | "br" | "rect";
interface IRegion extends Region {
  show?: boolean;
}

/** Properties of the Preview Component. */
interface PreviewProps {
  /** A canvas to render as the image. */
  image: HTMLCanvasElement;
  /** Initial selection on the image, setting this, won't send a selection change event. */
  selection: RectCoords;
  /** List of regions to display on the image */
  regions: IRegion[];
  /** Handler for changed selection. */
  onSelectionChange?: (r: RectCoords) => void;
  /** Maximal width of the image to display in pixels. */
  maxWidth?: number;
  /** Maximal height of the image to display in pixels. */
  maxHeight?: number;
  /** minimal width of the image to display in pixels. */
  minWidth?: number;
  /** minimal height of the image to display in pixels. */
  minHeight?: number;
  /** Color of the dot, which is rendered center of not selected regions. */
  dotColor: string;
  /** Minimum width of the cropper to display in pixels. */
  minCropWidth: number;
  /** Minimum height of the cropper to display in pixels. */
  minCropHeight: number;
  /** handles if the image corner should be rounded */
  rounded?: boolean;
  /** enables image expand animation*/
  expandAnimation?: boolean;
  /** enables image shrink animation*/
  shrinkAnimation?: boolean;
  /** enables/disables corner grips*/
  showGrip?: boolean;
  /** on expand. */
  onExpand?: () => void;
  /** wrapper styles */
  style?: React.CSSProperties | undefined;
  /** enable resize on window resize */
  resize?: boolean;
  /** enables draggable of cropping frame */
  draggable?: boolean;
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

const gripStrokeWidth = 5;

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
  { x1, x2, y1, y2 }: RectCoords,
  minWidth?: number,
  minHeight?: number
) {
  const cover = {
    x1: Math.max(x1 * width, gripStrokeWidth),
    x2: Math.min(x2 * width, width - gripStrokeWidth),
    y1: Math.max(y1 * height, gripStrokeWidth),
    y2: Math.min(y2 * height, height - gripStrokeWidth),
  };

  if (
    minWidth &&
    minHeight &&
    cover.x2 - cover.x1 < minWidth &&
    cover.y2 - cover.y1 < minHeight
  ) {
    return {
      x1: Math.max(x1 * width - minWidth / 2, gripStrokeWidth),
      x2: Math.min(x2 * width + minWidth / 2, width - gripStrokeWidth),
      y1: Math.max(y1 * height - minHeight / 2, gripStrokeWidth),
      y2: Math.min(y2 * height + minHeight / 2, height - gripStrokeWidth),
    };
  }

  return cover;
}

/** The Preview component. */
const Preview = ({
  dotColor,
  image,
  maxHeight: initialMaxHeightProps,
  maxWidth: initialMaxWidthProps,
  minHeight = 80,
  minWidth = 80,
  minCropHeight,
  minCropWidth,
  onSelectionChange,
  regions,
  rounded,
  selection,
  expandAnimation,
  shrinkAnimation,
  onExpand,
  showGrip = true,
  style,
  resize,
  draggable = true,
}: PreviewProps) => {
  const divRef = useRef<any>(null);
  const stageRef = useRef<any>(null);
  const shrinkAnimationRef = useRef<any>(shrinkAnimation);

  const maxSizeRef = useRef<any>({
    width: 0,
    height: 0,
  });

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [imageSelection, setImageSelection] = useState(selection);

  const [initialWidth, setInitialWidth] = useState(0);

  const [initialMaxWidth, setInitialMaxWidth] = useState(initialMaxWidthProps);
  const [initialMaxHeight, setInitialMaxHeight] = useState(
    initialMaxHeightProps
  );
  let gripSize = 20;
  let gripPadding = gripSize;
  const bound = -1 * gripPadding;
  let gripOffset = 5;

  useEffect(() => {
    shrinkAnimationRef.current = shrinkAnimation;
  }, [shrinkAnimation]);

  const handleResize = () => {
    if (divRef.current?.offsetWidth && !shrinkAnimationRef.current) {
      setInitialWidth(divRef.current?.offsetWidth);
      if (!initialMaxHeight) {
        setInitialMaxHeight(divRef.current?.offsetWidth);
        setInitialMaxWidth(divRef.current?.offsetWidth);
      }

      setDimensions({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetWidth,
      });
    }

    if (divRef.current?.offsetWidth) {
      maxSizeRef.current = {
        maxHeight: divRef.current.offsetWidth,
        maxWidth: divRef.current.offsetWidth,
      };
    }
  };

  const maxHeight = initialMaxHeight || dimensions.height;
  const maxWidth = initialMaxWidth || dimensions.width;

  useEffect(() => {
    setImageSelection(selection);
  }, [selection]);

  useEffect(() => {
    if (divRef.current?.offsetWidth) {
      setInitialWidth(divRef.current?.offsetWidth);
      if (!initialMaxHeight) {
        setInitialMaxHeight(divRef.current?.offsetWidth);
        setInitialMaxWidth(divRef.current?.offsetWidth);
      }

      if (!shrinkAnimation) {
        setDimensions({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetWidth,
        });
      }
    }

    if (resize) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let { w, h } = getThumbSizeLongestEdge(
    dimensions.width,
    dimensions.height,
    image.width,
    image.height
  );
  const width = Math.max(minWidth, w);
  const height = Math.max(minHeight, h);

  const { x1, y1, x2, y2 } = scaleToPreviewPixels(
    width,
    height,
    imageSelection,
    minCropWidth,
    minCropHeight
  );
  let [minX, minY] = [100, 100];

  const handleDragBoundTl = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.max(Math.min(x, x2 - minX), bound + gripStrokeWidth + gripOffset),
      y: Math.max(Math.min(y, y2 - minY), bound + gripStrokeWidth + gripOffset),
    };
  };

  const handleDragBoundTr = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.min(
        Math.max(x, x1 + minX),
        width + bound - (gripStrokeWidth + gripOffset)
      ),
      y: Math.max(Math.min(y, y2 - minY), bound + gripStrokeWidth + gripOffset),
    };
  };

  const handleDragBoundBl = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.max(Math.min(x, x2 - minX), bound + gripStrokeWidth + gripOffset),
      y: Math.min(
        Math.max(y, y1 + minY),
        height + bound - (gripStrokeWidth + gripOffset)
      ),
    };
  };

  const handleDragBoundBr = ({ x, y }: { x: number; y: number }) => {
    return {
      x: Math.min(
        Math.max(x, x1 + minX),
        width + bound - (gripStrokeWidth + gripOffset)
      ),
      y: Math.min(
        Math.max(y, y1 + minY),
        height + bound - (gripStrokeWidth + gripOffset)
      ),
    };
  };

  const handleDragBoundRect = ({ x, y }: { x: number; y: number }) => {
    let elemWidth = x2 - x1 + gripStrokeWidth;
    let elemHeight = y2 - y1 + gripStrokeWidth;
    return {
      x: Math.max(Math.min(x, width - elemWidth), gripStrokeWidth),
      y: Math.max(Math.min(y, height - elemHeight), gripStrokeWidth),
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

    let gripOffsetX = gripOffset;
    let gripOffsetY = gripOffset;

    if (elem === "tl") {
      gripOffsetX = gripOffsetX * -1;
      gripOffsetY = gripOffsetY * -1;
    }
    if (elem === "tr") {
      gripOffsetX = gripOffsetX * 1;
      gripOffsetY = gripOffsetY * -1;
    }
    if (elem === "bl") {
      gripOffsetX = gripOffsetX * -1;
      gripOffsetY = gripOffsetY * 1;
    }
    if (elem === "br") {
      gripOffsetX = gripOffsetX * 1;
      gripOffsetY = gripOffsetY * 1;
    }

    const modifiedX = newX + (elem !== "rect" ? gripPadding + gripOffsetX : 0);
    const modifiedY = newY + (elem !== "rect" ? gripPadding + gripOffsetY : 0);

    const newRect = calcNewRect(
      { x1, x2, y1, y2 },
      elem,
      modifiedX,
      modifiedY,
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
    setImageSelection(r);
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
      key: `${x}-${y}-${i}`,
      x,
      y,
      show: region.show,
    };
  });

  let darkOpacity = shrinkAnimation ? 0.4 : 0.3;
  const cornerRadius = [4, 4, 4, 4];
  const clipFunc = (ctx: any) => {
    ctx.beginPath();
    let topLeft = 0;
    let topRight = 0;
    let bottomLeft = 0;
    let bottomRight = 0;
    if (typeof cornerRadius === "number" && rounded) {
      topLeft =
        topRight =
        bottomLeft =
        bottomRight =
          Math.min(cornerRadius, width / 2, height / 2);
    } else if (rounded) {
      topLeft = Math.min(cornerRadius[0] || 0, maxWidth / 2, maxHeight / 2);
      topRight = Math.min(cornerRadius[1] || 0, maxWidth / 2, maxHeight / 2);
      bottomRight = Math.min(cornerRadius[2] || 0, maxWidth / 2, maxHeight / 2);
      bottomLeft = Math.min(cornerRadius[3] || 0, maxWidth / 2, maxHeight / 2);
    }
    ctx.moveTo(topLeft, 0);
    ctx.lineTo(maxWidth - topRight, 0);
    ctx.arc(
      maxWidth - topRight,
      topRight,
      topRight,
      (Math.PI * 3) / 2,
      0,
      false
    );
    ctx.lineTo(maxWidth, maxHeight - bottomRight);
    ctx.arc(
      maxWidth - bottomRight,
      maxHeight - bottomRight,
      bottomRight,
      0,
      Math.PI / 2,
      false
    );
    ctx.lineTo(bottomLeft, maxHeight);
    ctx.arc(
      bottomLeft,
      maxHeight - bottomLeft,
      bottomLeft,
      Math.PI / 2,
      Math.PI,
      false
    );
    ctx.lineTo(0, topLeft);
    ctx.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
    ctx.closePath();
  };
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    if (!maxSizeRef.current.maxWidth) {
      const maxHeight = initialMaxHeight || divRef.current.offsetWidth;
      const maxWidth = initialMaxWidth || divRef.current.offsetWidth;
      maxSizeRef.current = {
        maxHeight,
        maxWidth,
      };
    }

    const newWidth = maxSizeRef.current.maxWidth;
    const newHeight = maxSizeRef.current.maxHeight;

    const animExpand = new Konva.Animation((frame: any) => {
      const easing = frame.time / 200;

      const currentWidth = minWidth;
      const currentHeight = minHeight;

      const widthDiff = newWidth - currentWidth;
      const heightDiff = newHeight - currentHeight;

      setDimensions({
        width: Math.min(
          currentWidth + easing * widthDiff,
          maxSizeRef.current.maxWidth
        ),
        height: Math.min(
          currentHeight + easing * heightDiff,
          maxSizeRef.current.maxHeight
        ),
      });

      if (frame.time >= 170) {
        animExpand.stop();
        setLoaded(true);
      }
    });

    if (expandAnimation) {
      setLoaded(false);
      animExpand.start();
    }

    return () => {
      animExpand.stop();
    };
  }, [expandAnimation]);

  useEffect(() => {
    const currentWidth = maxSizeRef.current.maxWidth;
    const currentHeight = maxSizeRef.current.maxHeight;

    const animShrink = new Konva.Animation((frame: any) => {
      const easing = frame.time / 200;
      const newWidth = minWidth;
      const newHeight = minHeight;

      const widthDiff = newWidth - currentWidth;
      const heightDiff = newHeight - currentHeight;

      setDimensions({
        width: currentWidth + easing * widthDiff,
        height: currentHeight + easing * heightDiff,
      });

      if (easing >= 1 || stageRef.current?.attrs?.width < minWidth) {
        animShrink.stop();
      }
    });

    if (shrinkAnimation && stageRef.current?.attrs?.width > minWidth) {
      animShrink.start();
    } else if (stageRef.current?.attrs?.width === 0) {
      setDimensions({
        width: minWidth || initialWidth,
        height: minHeight || initialWidth,
      });
    }

    return () => {
      animShrink.stop();
    };
  }, [shrinkAnimation]);

  return (
    <div ref={divRef} style={{ width: "100%", ...style }}>
      <Stage
        width={width}
        height={height}
        style={{
          cursor: getCursor(state),
          width: width,
          height: height,
          margin: "auto",
        }}
        ref={(ref) => {
          stageRef.current = ref;
        }}
        onClick={() => {
          if (onExpand) onExpand();
        }}
        onTap={() => {
          if (onExpand) onExpand();
        }}
      >
        <Layer key="img" clipFunc={clipFunc}>
          <Image image={image} width={width} height={height} fill="white" />
        </Layer>
        {loaded && (
          <>
            <Layer key="selection" clipFunc={clipFunc}>
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
                draggable={draggable ? true : false}
                onDragMove={handleDragMoveRect}
                dragBoundFunc={handleDragBoundRect}
                onDragEnd={() => {
                  if (onSelectionChange) {
                    onSelectionChange(imageSelection);
                  }
                }}
                onMouseOver={() => {
                  if (draggable) setState({ rectHover: true });
                }}
                onMouseOut={() => {
                  setState({ rectHover: false });
                }}
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
              {/* top */}
              <Rect
                fill="black"
                opacity={darkOpacity}
                x={0}
                y={0}
                width={width}
                height={y1 + 0.08}
              />
              {/* bottom */}
              <Rect
                fill="black"
                opacity={darkOpacity}
                x={0}
                y={y2}
                width={width}
                height={height - y2}
              />
              {/* left */}
              <Rect
                fill="black"
                opacity={darkOpacity}
                x={0}
                y={y1}
                width={x1}
                height={y2 - y1 + 0.08}
              />
              {/* right */}
              <Rect
                fill="black"
                opacity={darkOpacity}
                x={x2}
                y={y1}
                width={width - x2}
                height={y2 - y1 + 0.08}
              />
            </Layer>

            {/* grips */}
            {showGrip && (
              <Layer>
                {/* top left */}
                <Path
                  data="M2 18V10C2 5.58172 5.58172 2 10 2H18"
                  stroke={"white"}
                  strokeWidth={gripStrokeWidth}
                  lineCap="round"
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
                  onDragEnd={() => {
                    if (onSelectionChange) {
                      onSelectionChange(imageSelection);
                    }
                  }}
                  opacity={1}
                  width={gripSize + gripPadding}
                  height={gripSize + gripPadding}
                  x={x1 - gripPadding + gripOffset}
                  y={y1 - gripPadding + gripOffset}
                />
                {/* top right */}
                <Path
                  data="M2 2L10 2C14.4183 2 18 5.58172 18 10L18 18"
                  stroke={"white"}
                  strokeWidth={gripStrokeWidth}
                  lineCap="round"
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
                  onDragEnd={() => {
                    if (onSelectionChange) {
                      onSelectionChange(imageSelection);
                    }
                  }}
                  opacity={1}
                  width={gripSize + gripPadding}
                  height={gripSize + gripPadding}
                  x={x2 - gripPadding - gripOffset}
                  y={y1 - gripPadding + gripOffset}
                  offsetX={gripSize - gripPadding}
                />
                {/* bottom left */}
                <Path
                  data="M18 18L10 18C5.58172 18 2 14.4183 2 10L2 2"
                  stroke={"white"}
                  strokeWidth={gripStrokeWidth}
                  lineCap="round"
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
                  onDragEnd={() => {
                    if (onSelectionChange) {
                      onSelectionChange(imageSelection);
                    }
                  }}
                  opacity={1}
                  width={gripSize + gripPadding}
                  height={gripSize + gripPadding}
                  x={x1 - gripPadding + gripOffset}
                  y={y2 - gripPadding - gripOffset}
                  offsetY={gripSize - gripPadding}
                />
                {/* bottom right */}
                <Path
                  data="M18 2L18 10C18 14.4183 14.4183 18 10 18L2 18"
                  stroke={"white"}
                  strokeWidth={gripStrokeWidth}
                  lineCap="round"
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
                  onMouseOver={() => {
                    setState({ brHover: true });
                  }}
                  onMouseOut={() => {
                    setState({ brHover: false });
                  }}
                  onDragEnd={() => {
                    if (onSelectionChange) {
                      onSelectionChange(imageSelection);
                    }
                  }}
                  pointerout={() => {
                    console.log("pointerout");
                  }}
                  x={x2 - gripPadding - gripOffset}
                  y={y2 - gripPadding - gripOffset}
                  width={gripSize + gripPadding}
                  height={gripSize + gripPadding}
                  offsetY={gripSize - gripPadding}
                  offsetX={gripSize - gripPadding}
                />
              </Layer>
            )}

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
                        if (onSelectionChange) {
                          onSelectionChange(data.region.normalizedRect);
                        }
                      }}
                      onTap={() => {
                        notifySelection(data.region.normalizedRect);
                        setState({ dotHover: false });
                        if (onSelectionChange) {
                          onSelectionChange(data.region.normalizedRect);
                        }
                      }}
                      onMouseOver={() => setState({ dotHover: true })}
                      onMouseOut={() => setState({ dotHover: false })}
                      key={key}
                      radius={7}
                      {...position}
                      stroke={dotColor}
                      fill="white"
                      strokeWidth={5}
                      opacity={dotColor ? data.region.show : 0}
                    />
                  ))}
                </Layer>
              )}
            </NodeGroup>
          </>
        )}
      </Stage>
    </div>
  );
};

export default Preview;
