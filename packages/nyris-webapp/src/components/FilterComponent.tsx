import React from "react";
import { Button, Grid } from "@material-ui/core";
import DefaultSelect from "components/default-select";

interface Props {}

function FilterComponent(props: Props) {
  return (
    <div className="box-main-filter">
      <Grid container>
        <Grid item className="item">
          <DefaultSelect attribute="brand" />
        </Grid>
        <Grid item className="item">
          <DefaultSelect attribute="keyword_0" />
        </Grid>

        <Grid item className="item-seven text-center">
          <Button
            className="text-btn-small bg-pink text-red"
            style={{ borderRadius: 12 }}
          >
            Clear x
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default FilterComponent;
