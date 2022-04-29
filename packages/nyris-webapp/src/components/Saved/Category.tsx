import { Grid } from "@material-ui/core";
import React from "react";

interface Props {
  nameCategory?: string;
}

function CategoryItemSaved(props: Props) {
  return (
    <Grid container>
      <Grid item xs={4}></Grid>
    </Grid>
  );
}

export default CategoryItemSaved;
