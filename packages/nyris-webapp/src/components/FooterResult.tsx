import { Box, Grid, Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import TitleOutlinedIcon from "@material-ui/icons/TitleOutlined";

interface Props {
  search: any;
}

function FooterResult(props: Props) {
  const {search} = props;

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      style={{ height: "100%" }}
    >
      <Grid
        item
        className="item-notify"
        style={{ borderRight: "1px solid #E9E9EC", minWidth: 69 }}
      >
        <Typography className="text-f8 text-center">
          {search.results.length} results
        </Typography>
      </Grid>
      <Grid item className="item-notify">
        <Typography className="text-f8 text-center">
          Didn’t find what you were looking for? Share your search with our{" "}
          <Link to={"#"}>product experts</Link>.
        </Typography>
      </Grid>
      <Grid item className="item-notify" style={{ minWidth: 32 }}>
        <Typography className="text-f8">
          <Box>
            <TitleOutlinedIcon style={{ color: "#55566B", fontSize: 8 }} />
            <TitleOutlinedIcon style={{ color: "#55566B", fontSize: 10 }} />
          </Box>
        </Typography>
      </Grid>
    </Grid>
  );
}

export default FooterResult;
