import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { connectPagination } from "react-instantsearch-dom";
import ArrowLeftOutlinedIcon from "@material-ui/icons/ArrowLeftOutlined";
import ArrowRightOutlinedIcon from "@material-ui/icons/ArrowRightOutlined";
interface Props {}

function Pagination({ nbPages, refine, children }: any) {
  const [pageCurrent, setPageCurrent] = useState(1);

  useEffect(() => {
    if (pageCurrent) {
      refine(pageCurrent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCurrent]);

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      style={{ height: "100%" }}
    >
      {children}

      <Grid item className="item-notify">
        <Typography className="text-f12 text-center">
          <span className="fw-600" style={{ color: "#2B2C46" }}>
            Didn’t find what you were looking for?
          </span>{" "}
          <span style={{ color: "#2B2C46" }}>Share your search with our</span>{" "}
          <Link to={"/support"} style={{ color: "#3E36DC" }}>
            product experts
          </Link>
          .
        </Typography>
      </Grid>
      <Grid item className="item-notify-right" style={{ minWidth: 32 }}>
        <Typography className="text-f8">
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
            <Box
              display={"flex"}
              alignItems={"center"}
              style={{ borderRight: "1px solid #e9e9ec", paddingRight: 20 }}
            >
              <Select
                labelId="demo-simple-select-label"
                value={pageCurrent}
                onChange={(event: any) => setPageCurrent(event.target.value)}
                className="select-choose-page"
              >
                {new Array(nbPages).fill(null).map((_, index) => {
                  const page = index + 1;
                  return <MenuItem value={page}>{page}</MenuItem>;
                })}
              </Select>
              <Box>
                <Typography className="text-f12" style={{ color: "#2B2C46" }}>
                  of {nbPages} pages
                </Typography>
              </Box>
            </Box>
            <Box>
              <Button
                className="btn-prev"
                style={{ borderRight: "1px solid #e9e9ec" }}
                onClick={() => {
                  if (1 === pageCurrent) {
                    return;
                  }
                  setPageCurrent(pageCurrent - 1);
                }}
              >
                <ArrowLeftOutlinedIcon />
              </Button>

              <Button
                className="btn-next"
                onClick={() => {
                  if (pageCurrent === nbPages) {
                    return;
                  }
                  setPageCurrent(pageCurrent + 1);
                }}
              >
                <ArrowRightOutlinedIcon />
              </Button>
            </Box>
          </Box>
        </Typography>
      </Grid>
    </Grid>
  );
}
const FooterResult = connectPagination(Pagination);

export default FooterResult;
