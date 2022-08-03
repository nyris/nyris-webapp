import React, { memo, useState } from "react";
import { ReactNode } from "components/common";
import "./common.scss";
import HeaderComponent from "./Header";
import FooterComponent from "./Footer";
import { useAppSelector, useAppDispatch } from "Store/Store";
import HeaderMdComponent from "./HeaderMd";
import FooterMD from "./FooterMD";
import HeaderNewVersion from "./HeaderNewVersion";
import FooterNewVersion from "./FooterNewVersion";
import { AlgoliaSettings, AppState } from "../types";
import { useMediaQuery } from "react-responsive";
import HeaderMobile from "./HeaderMobile";
import FooterMobile from "./FooterMobile";
import "./appMobile.scss";
import { InstantSearch } from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import { changeValueTextSearch } from "Store/Search";
import { Box } from "@material-ui/core";
import ExpandablePanelComponent from "./PanelResult";

function Layout({ children }: ReactNode): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { valueTextSearch } = search;
  const { themePage } = settings;
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  searchClient.initIndex(indexName);
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);

  let HeaderApp: any;
  let FooterApp: any;
  let classNameBoxVersion: string = "newVersion";
  if (isMobile) {
    classNameBoxVersion = "mobile";
    HeaderApp = HeaderMobile;
    FooterApp = FooterMobile;
  } else {
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
  }

  return (
    <Box position={"relative"} className="wrap-mobile">
      <InstantSearch
        indexName={indexName}
        searchClient={searchClient}
        searchState={valueTextSearch}
        onSearchStateChange={(state) => {
          console.log("state", state);
          dispatch(changeValueTextSearch(state));
        }}
      >
        <div className={`layout-main-${classNameBoxVersion}`}>
          <div className={`box-header-${classNameBoxVersion}-main`}>
            <HeaderApp
              onToggleFilterMobile={() => {
                setOpenFilter(!isOpenFilter);
              }}
            />
          </div>
          <div className={`box-body-${classNameBoxVersion}-wrap-main`}>
            {children}
          </div>
          <div className="footer-wrap-main">
            <FooterApp />
          </div>
        </div>
        {isMobile && (
          <Box
            className={`box-fillter ${isOpenFilter ? "open" : "close"} `}
            position={"absolute"}
          >
            <ExpandablePanelComponent
              onToogleApplyFillter={() => {
                setOpenFilter(!isOpenFilter);
              }}
            />
          </Box>
        )}
      </InstantSearch>
    </Box>
  );
}

export default memo(Layout);
