import { Box, Button, Typography } from "@material-ui/core";
import React from "react";
import ListSearch from "components/search/ListSearch";

interface Option {
  readonly label: string;
  readonly value: string;
}

function SearchHistory(): JSX.Element {
  return (
    <Box className="wrap-main-search-history">
      <Box className="box-main-top">
        <Box className="box-input">
          {/* <InputSearch
            inputValueInputSearch={inputValueInputSearch}
            handleChange={handleChangeInputSearch}
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
      </Box>

      <Box className="box-main-bottom">
        <Box className="col-left">
          <ul className="box-time">
            <li>
              <Button>
                <Typography className="text-f9 active">2021</Typography>
              </Button>
            </li>
            <li>
              <Button>
                <Typography className="text-f9">2020</Typography>
              </Button>
            </li>
          </ul>
        </Box>
        <Box className="col-right">
          <ListSearch />
          <ListSearch />
        </Box>
      </Box>
    </Box>
  );
}

export default SearchHistory;
