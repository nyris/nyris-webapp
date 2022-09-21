import { Box } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import "./common.scss";
// import TranslateIcon from "common/assets/icons/translate_icon.svg";
import DragDropFile from "components/DragDropFile";
import { cadExtensions } from "@nyris/nyris-api";
import { useAppDispatch, useAppSelector } from "Store/Store";
import {  setUpdateSession } from "Store/Search";
import { Link } from "react-router-dom";
import {
  Configure,
  connectInfiniteHits,
} from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import CustomSearchBox from "components/input/inputSearch";
import { createSessionByApi } from "../../services/session";
import { AlgoliaSettings } from "../../types";
import IconSupport from "common/assets/icons/support3.svg";
import { useMediaQuery } from "react-responsive";

interface Props {}

function AppNewVersion(props: Props) {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector((state) => state);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  searchClient.initIndex(indexName);
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });

  useEffect(() => {
    const createSession = async () => {
      let payload = await createSessionByApi(settings);
      dispatch(setUpdateSession(payload));
    };

    createSession().catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptTypes = ["image/*"]
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(",");

  const InfiniteHits = ({ hits }: any) => {
    return <div></div>;
  };

  const onChangeLoading = (value: boolean) => {
    setLoading(value);
  };

  const CustomInfiniteHits = connectInfiniteHits(InfiniteHits);

  // const nonEmptyFilter: any[] = !search?.requestImage
  //   ? []
  //   : ["sku:DOES_NOT_EXIST<score=1>"];
  // // Build filter using reverse position for stable item order
  // const filterSkus: any = search?.results
  //   ? search?.results
  //       .slice()
  //       .reverse()
  //       .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}>`)
  //   : "";
  // const filtersString = [...nonEmptyFilter, ...filterSkus].join(" OR ");

  return (
    <Box className={`box-content-main ${isLoading ? "loading" : ""}`}>
      {isMobile && (
        <Box className="btn-open-support">
          <Link to={"/support"} style={{ color: "#3E36DC" }}>
            <img src={IconSupport} alt="" width={16} height={16} />
          </Link>
        </Box>
      )}
      <Box className="box-content_top">
        <Box className="fw-700 text-f32 text-dark2">
          <h1>Visual Search Suite – Nyris</h1>
        </Box>
        <div className="box-input">
          <div className="wrap-input-search">
            <div style={{ display: "none" }}>
              <CustomInfiniteHits />
            </div>
            <CustomSearchBox />
          </div>
        </div>
      </Box>
      <Box className="box-content_bottom">
        <DragDropFile
          acceptTypes={acceptTypes}
          isLoading={isLoading}
          onChangeLoading={onChangeLoading}
        />
      </Box>
    </Box>
  );
}

export default AppNewVersion;
