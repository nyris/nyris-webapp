import { Box, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import "./common.scss";
import TranslateIcon from "common/assets/icons/translate_icon.svg";
import DragDropFile from "components/DragDropFile";
import { cadExtensions } from "@nyris/nyris-api";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { changeValueTextSearch, setUpdateSession } from "Store/Search";
import { useHistory } from "react-router-dom";
import {
  Configure,
  InstantSearch,
  connectInfiniteHits,
} from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import CustomSearchBox from "components/input/inputSearch";
import {createSessionByApi} from "../../services/session";

interface Props {}

function AppNewVersion(props: Props) {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const searchState = useAppSelector((state) => state);
  const { settings, search }: any = searchState;
  const [searchStateInput, setSearchStateInput] = useState<any>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const { apiKeyAlgolia, appIdAlgolia, indexNameAlgolia } = settings;
  const searchClient = algoliasearch(appIdAlgolia, apiKeyAlgolia);
  searchClient.initIndex(indexNameAlgolia);

  useEffect(() => {
    const createSession = async () => {
      let payload = await createSessionByApi(searchState.settings);
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

  const nonEmptyFilter: any[] = !search?.requestImage
    ? []
    : ["sku:DOES_NOT_EXIST<score=1>"];
  // Build filter using reverse position for stable item order
  const filterSkus: any = search?.results
    ? search?.results.slice().reverse().map(
        (f: any, i: number) => `sku:'${f.sku}'<score=${i}>`
      )
    : "";
  const filtersString = [...nonEmptyFilter, ...filterSkus].join(" OR ");

  return (
    <Box className={`box-content-main ${isLoading ? "loading" : ""}`}>
      <InstantSearch
        indexName={indexNameAlgolia}
        searchClient={searchClient}
        searchState={searchStateInput}
        onSearchStateChange={(state: any) => {
          setSearchStateInput(state);
          dispatch(changeValueTextSearch(state));
          history.push("/result");
        }}
      >
        <Box className="box-content_top">
          <div className="box-logo">
            <img src={TranslateIcon} width={32} height={27} alt="logo_icon" />
          </div>
          <div className="box-input">
            <div className="wrap-input-search">
              <Configure filters={filtersString}></Configure>
              <div style={{ display: "none" }}>
                <CustomInfiniteHits />
              </div>
              <CustomSearchBox />
            </div>
          </div>
          <div className="box-bottom">
            <Typography className="text-bottom">
              Search by any name, category, SKU or keyword.
            </Typography>
          </div>
        </Box>
        <Box className="box-content_bottom">
          <DragDropFile
            acceptTypes={acceptTypes}
            isLoading={isLoading}
            onChangeLoading={onChangeLoading}
          />
        </Box>
      </InstantSearch>
    </Box>
  );
}

export default AppNewVersion;
