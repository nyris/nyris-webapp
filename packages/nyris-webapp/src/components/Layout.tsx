import React from "react";
import { ReactNode } from "components/common";
import "./common.scss";
import HeaderComponent from "./Header";
import FooterComponent from "./Footer";
import { useAppSelector } from "Store/Store";
import HeaderMdComponent from "./HeaderMd";
import FooterMD from "./FooterMD";
import HeaderNewVersion from "./HeaderNewVersion";
import FooterNewVersion from "./FooterNewVersion";
import {AppState} from "../types";
function Layout({ children }: ReactNode): JSX.Element {
  const { settings } = useAppSelector<AppState>((state:any) => state);
  const { themePage } = settings;
  
  let HeaderApp: any;
  let FooterApp: any;
  let classNameBoxVersion: string = "newVersion";
  if (themePage.default?.active) {
    classNameBoxVersion = "default";
    HeaderApp = HeaderComponent;
    FooterApp = FooterComponent;
  } else if (themePage.materialDesign?.active) {
    classNameBoxVersion = "materialDesign";
    HeaderApp = HeaderMdComponent;
    FooterApp = FooterMD;
  } else {
    HeaderApp = HeaderNewVersion;
    FooterApp = FooterNewVersion;
  }
  return (
    <div className={`layout-main-${classNameBoxVersion}`}>
      <div className={`box-header-${classNameBoxVersion}-main`}>
        <HeaderApp />
      </div>
      <div className={`box-body-${classNameBoxVersion}-wrap-main`}>
        {children}
      </div>
      <div className="footer-wrap-main">
        <FooterApp />
      </div>
    </div>
  );
}

export default Layout;
