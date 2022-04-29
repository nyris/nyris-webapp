import { Box, Button } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import {
  NavLink,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import AllItem from "components/Saved/AllItem";
import CategoryItemSaved from "components/Saved/Category";
import { useEffect } from "react";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import { dataItem } from "./MockData";
interface Props {}

interface Option {
  readonly label: string;
  readonly value: string;
}

const collections = [
  {
    value: "all",
    title: "All",
  },
  {
    value: "collections",
    title: "Collections",
  },
];

const useQuery = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

function Saved(props: Props) {
  let query = useQuery();
  const getCategory = query.get("category");
  let { url } = useRouteMatch();
  const [nameCategory, setNameCategory] = useState<string>("all");
  const [collectionParams] =
    useState<any[any]>(collections);
  useEffect(() => {
    if (getCategory) {
      setNameCategory(getCategory);
    }
  }, [getCategory]);

  // console.log("history", history?.location);

  // const handleCheckMatchLink = (match: any, location: any) => {
  //   let active = false;
  //   if (history?.location.search === location?.search) {
  //     active = true;
  //   }
  //   // if (match?.url === location.pathname) {
  //   //   active = true;
  //   // }

  //   return active;
  // };

  // console.log("query", query.get("category"));

  console.log("collectionParams", collectionParams);

  return (
    <Box className="wrap-main-saved">
      <Box className="box-main-top">
        <Box className="box-top">
          <Box
            className="box-input-search"
            display={"flex"}
            justifyContent={"center"}
          >
            {/* <InputSearch
              inputValueInputSearch={inputValueInputSearch}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              handleInputChange={handleInputChange}
              valueInputSearch={valueInputSearch}
              styleControl={{
                width: 640,
                background: "#FFFFFF",
                boxShadow: "0px 0px 6.66667px rgba(0, 0, 0, 0.2)",
                borderRadius: 21,
                minHeight: 42,
                display: "flex",
                alignItems: "center",
                paddingLeft: "16px",
              }}
              placeholder={"Search"}
              customComponent={{
                DropdownIndicator: () => {
                  return (
                    <Box mr={1}>
                      <button
                        className="btn-input-search"
                        onClick={() => {
                          console.log("321");
                        }}
                      >
                        <img src={IconSetting} alt="icon_search" />
                      </button>
                    </Box>
                  );
                },
              }}
            /> */}
          </Box>
          {collectionParams?.length > 0 && (
            <Box className="box-bottom">
              {collectionParams.map((item: any, index: any) => {
                console.log("itemmmmmmm", item);

                return (
                  <Box mr={1}>
                    <NavLink
                      key={index}
                      // activeClassName="active"
                      // isActive={(match, location) => {
                      //   console.log("match", match);

                      //   return location?.search === history?.location.search
                      //     ? true
                      //     : false;
                      // }}
                      to={`${url}?category=${item.value}`}
                      className="nav-link p-0 menu-children rounded-0"
                    >
                      <span
                        className={`d-none d-sm-block ms-4 px-2 py-1 border-bottom-1 ${
                          nameCategory === "all" ? "active1" : "active2"
                        }`}
                      >
                        {item.title}
                      </span>
                    </NavLink>
                  </Box>
                );
              })}
              <Button style={{ backgroundColor: "#D8D7F8" }}>
                <AddOutlinedIcon style={{ color: "#3E36DC", fontSize: 12 }} />
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box className="box-main-bottom">
        {collectionParams.length > 0 && (
          <Box>
            {nameCategory === "all" ? (
              <AllItem dataItem={dataItem} isHover={true} />
            ) : (
              <CategoryItemSaved nameCategory={nameCategory} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Saved;
