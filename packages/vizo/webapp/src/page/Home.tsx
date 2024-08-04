import classNames from "classnames";

import React from "react";
import DragAndDrop from "../components/DragAndDrop";
import { ReactComponent as CameraIcon } from "../assets/take_photo.svg";
import { ReactComponent as CameraSimpleIcon } from "../assets/camera_simple.svg";
import { ReactComponent as ArrowEnter } from "../assets/arrow_enter.svg";

import "../style/takePhoto.scss";
import PreFilterMobile from "../components/PreFilterMobile";

interface IAppProps {
  search: (fs: File) => void;
  searchBar: React.ReactNode;
  setSearchImage: any;
  setImageThumb: any;
  imageSearch: any;
  setIsCameraOpen: any;
  isCameraOpen: boolean;
  setSelectedPreFilters: any;
  selectedPreFilters: any;
}

function Home(props: IAppProps) {
  const {
    search,
    searchBar,
    setImageThumb,
    setSearchImage,
    setIsCameraOpen,
    selectedPreFilters,
    setSelectedPreFilters,
  } = props;

  return (
    <>
      <div className="hidden md:block">
        <DragAndDrop
          search={search}
          searchBar={searchBar}
          setSearchImage={setSearchImage}
          setImageThumb={setImageThumb}
        />
      </div>
      <div
        className="take-photo cursor-pointer block md:hidden"
        onClick={() => {
          setIsCameraOpen(true);
        }}
      >
        <div
          className="take-photo-wrapper cursor-pointer"
          style={{
            background: "linear-gradient(90deg, #2B2C46 0%, #1E1F31 100%)",
          }}
        >
          <div className="outer">
            <div className="inner">
              <CameraIcon color={"#2B2C46"} />
            </div>
          </div>
        </div>
      </div>
      {/* <div
        className={classNames([
          "block",
          "md:hidden",
          "fixed",
          "bottom-14",
          "w-full",
        ])}
      >
        <div className={classNames(["px-2"])}>
          <div
            className={classNames([
              "h-12",
              "rounded-3xl",
              "shadow-outer",
              "w-full",
              "bg-white",
              "px-2",
              "flex",
              "items-center",
              "justify-between",
            ])}
          >
            <div className="flex flex-1 gap-x-2">
              <PreFilterMobile
                setPreFilters={(prefilters) =>
                  setSelectedPreFilters(prefilters)
                }
                selectedPreFilters={selectedPreFilters}
              />
              <input
                placeholder="Message Vizo..."
                className="text-xs outline-none w-full pr-2"
              />
            </div>
            <div className="flex gap-x-2">
              <div
                className={classNames([
                  "w-8",
                  "h-8",
                  "rounded-3xl",
                  "flex",
                  "justify-center",
                  "items-center",
                  "bg-[#F3F3F5]",
                ])}
              >
                <ArrowEnter className="text-white" />
              </div>

              <div
                className={classNames([
                  "w-8",
                  "h-8",
                  "rounded-3xl",
                  "flex",
                  "justify-center",
                  "items-center",
                  "bg-[#F3F3F5]",
                ])}
                onClick={() => {
                  setIsCameraOpen(true);
                }}
              >
                <CameraSimpleIcon className="text-[#3E36DC]" />
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default Home;
