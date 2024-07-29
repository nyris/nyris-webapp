import { memo, useState } from "react";
import { RectCoords } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import { ReactComponent as ArrowUp } from "../assets/arrow_up.svg";
import { ReactComponent as ArrowDown } from "../assets/arrow_down.svg";
import { ReactComponent as Trash } from "../assets/trash.svg";

const DEFAULT_REGION = { x1: 0, x2: 1, y1: 0, y2: 1 };

function ImagePreviewMobileComponent({
  requestImage,
  imageSelection,
  filteredRegions,
  onImageRemove,
  onSelection,
}: {
  requestImage: HTMLCanvasElement;
  imageSelection: any;
  filteredRegions: any;
  onImageRemove: any;
  onSelection: any;
}) {
  const [editActive, setEditActive] = useState(false);

  const handleArrowClick = () => {
    setEditActive((s) => !s);
  };

  return (
    <div
      className="col-left"
      style={{
        backgroundColor: "#5D5D63",
        marginBottom: "15px",
      }}
    >
      <div>
        <div className="">
          <div>
            <div
              className=""
              style={{
                backgroundColor: "transparent",
              }}
            >
              <Preview
                key={"requestImage?.id"}
                onSelectionChange={(r: RectCoords) => {
                  onSelection(r);
                }}
                image={requestImage}
                selection={imageSelection || DEFAULT_REGION}
                regions={filteredRegions}
                minWidth={Math.min(
                  80 * (requestImage?.width / requestImage?.height),
                  200
                )}
                minHeight={80}
                maxWidth={255}
                maxHeight={255}
                dotColor={editActive ? "#FBD914" : ""}
                minCropWidth={editActive ? 30 : 5}
                minCropHeight={editActive ? 30 : 5}
                rounded={false}
                expandAnimation={editActive}
                shrinkAnimation={!editActive}
                onExpand={() => {
                  setEditActive(true);
                }}
                showGrip={editActive}
                draggable={editActive ? true : false}
              />
            </div>
          </div>
        </div>
        <>
          <div>
            <div
              style={{
                position: "absolute",
                left: "15px",
                top: "70px",
                padding: "4px",
              }}
              onClick={() => {
                onImageRemove();
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  borderRadius: "100%",
                }}
              >
                <Trash color="white" fill="white" />
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                position: "absolute",
                top: "80px",
                right: "20px",
              }}
              onClick={handleArrowClick}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  borderRadius: "100%",
                  backgroundColor: "white",
                }}
              >
                {editActive && <ArrowUp color="black" />}
                {!editActive && <ArrowDown color="black" fill="black" />}
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}
const ImagePreviewMobile = memo(ImagePreviewMobileComponent);
export default ImagePreviewMobile;
