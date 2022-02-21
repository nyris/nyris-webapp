import React from "react";
import { ReactNode } from "components/common";
import "./common.scss";
import HeaderComponent from "./Header";
import FooterComponent from "./Footer";
import { useAppSelector } from "Store/Store";
import HeaderMdComponent from "./HeaderMd";
import FooterMD from "./FooterMD";
function Layout({ children }: ReactNode): JSX.Element {
  const { settings } = useAppSelector((state) => state);
  let useMd = settings.materialDesign !== undefined;
  return (
    <div className="layout-main">
      <div className="header-wrap-main">
        {useMd ? (
          <HeaderMdComponent settings={settings} />
        ) : (
          <HeaderComponent />
        )}
      </div>
      <div className="body-wrap-main">{children}</div>
      <div className="footer-wrap-main">
        {useMd ? <FooterMD /> : <FooterComponent />}
      </div>
    </div>
  );
}

export default Layout;
