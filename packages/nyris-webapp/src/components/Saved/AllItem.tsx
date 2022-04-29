import { Grid } from "@material-ui/core";
import ItemResult from "components/results/ItemResult";
import React from "react";

interface Props {
  dataItem: any[];
  isHover?: boolean
}

function AllItem(props: Props) {
  const { dataItem } = props;

  return (
    <Grid container spacing={2}>
      {dataItem &&
        dataItem.map((item: any, index: any) => {
          return (
            <Grid item sm={3} key={index}>
              <ItemResult
                dataItem={item}
                isHover={true}
                // handlerToggleModal={handlerToggleModal}
                // handlerToggleModalShare={() => setOpenModalShare(true)}
              />
            </Grid>
          );
        })}
    </Grid>
  );
}

export default AllItem;
