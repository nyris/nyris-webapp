import { Box, Button, Grid } from "@material-ui/core";
import DefaultSelect from "components/default-select";
import React from "react";

interface Props {
  dataFieldOne: any[];
  dataFieldTow: any[];
  dataFieldThree: any[];
  dataFieldFour: any[];
  dataFieldFive: any[];
  dataFieldSix: any[];
}

function FilterComponent(props: Props) {
  const {
    dataFieldOne,
    dataFieldTow,
    dataFieldThree,
    dataFieldFour,
    dataFieldFive,
    dataFieldSix,
  } = props;

  return (
    <Box className="box-main-filter">
      <Grid container>
        <Grid item className="item">
          <DefaultSelect attribute="brand"  />
        </Grid>
        <Grid item className="item">
          <DefaultSelect attribute="keyword_0"  />
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
    </Box>
  );
}

export default FilterComponent;
