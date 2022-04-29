import * as React from "react";
import {
  DataGrid,
} from "@material-ui/data-grid";
import { Box, Button, Typography } from "@material-ui/core";
import ViewOff from "common/assets/icons/view_off.png";
import ImageTest from "common/assets/images/image_test.png";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import KeyboardArrowUpOutlinedIcon from "@material-ui/icons/KeyboardArrowUpOutlined";
import KeyboardArrowDownOutlinedIcon from "@material-ui/icons/KeyboardArrowDownOutlined";
// image_test.png
const handleCellClick = (param: any, event: any) => {
  // console.log(param);
  // console.log(event);
  if (param.colIndex === 2) {
    event.stopPropagation();
  }
};

const handleRowClick = (param: any, event: any) => {
  // console.log("Row:");
  // console.log(param);
  // console.log(event);
};

const columns: any = [
  {
    field: "time",
    headerName: "Time",
    width: 42,
    renderHeader: (params: any) => {
      return (
        <Typography className="text-f9 text-white fw-700">Time</Typography>
      );
    },
    renderCell: (cellValues: any) => {
      console.log("cellValues", cellValues);
      return (
        <Typography className="text-f9 fw-500 text-gray2">
          {cellValues.value}
        </Typography>
      );
    },
  },
  {
    field: "search",
    headerName: "Search",
    width: 139,
    renderHeader: (params: any) => {
      return (
        <Typography className="text-f9 text-white fw-700">Search</Typography>
      );
    },
    renderCell: (cellValues: any) => {
      console.log("cellValues", cellValues);
      return (
        <Box display={"flex"} alignItems={"center"}>
          <Box className="box-image-search">
            <img src={cellValues?.row.search.image} alt="img_search" />
          </Box>
          <Typography className="text-f9 text-gray2 fw-500">
            {cellValues?.row.search.text}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: "order",
    headerName: "Order",
    width: 112,
    renderHeader: (params: any) => {
      return (
        <Typography className="text-f9 text-white fw-700">Order</Typography>
      );
    },
    renderCell: (cellValues: any) => {
      console.log("cellValues", cellValues);
      return (
        <Typography className="text-f9 text-gray2 fw-500">
          {cellValues?.row.order ? cellValues?.row.order : "_"}
        </Typography>
      );
    },
  },
  {
    field: "device",
    headerName: "Device",
    width: 161,
    // align: "left",
    renderHeader: (params: any) => {
      return (
        <Typography className="text-f9 text-white fw-700">Device</Typography>
      );
    },
    renderCell: (cellValues: any) => {
      console.log("cellValues", cellValues);
      return (
        <Typography className="text-f9 text-gray2 fw-500">
          {cellValues?.row.device ? cellValues?.row.device : "_"}
        </Typography>
      );
    },
  },
  {
    field: "more",
    headerName: "More",
    sortable: false,
    width: 48,
    // valueGetter: (params: any) => {
    //   return `${params.getValue(params.id, "firstName") || ""} ${
    //     params.getValue(params.id, "lastName") || ""
    //   }`;
    // },
    renderHeader: (params: any) => {
      return (
        <Typography className="text-f9 text-white fw-700">More</Typography>
      );
    },
    renderCell: (cellValues: any) => {
      console.log("cellValues", cellValues);
      return (
        <Box>
          <Button>
            <MoreVertOutlinedIcon style={{ fontSize: 12 }} />
          </Button>
        </Box>
      );
    },
  },
];

const rows = [
  {
    id: 1,
    time: "14:32",
    search: {
      image: ViewOff,
      text: "engine bühler",
    },
    order: "",
    device: "Desktop app",
    more: "",
  },
  {
    id: 2,
    time: "14:32",
    search: {
      image: ImageTest,
      text: "",
    },
    order: "Secondary search",
    device: "Desktop app",
    more: "",
  },
  {
    id: 3,
    time: "14:32",
    search: {
      image: ViewOff,
      text: "engine bühler",
    },
    order: "",
    device: "Desktop app",
    more: "",
  },
];

export default function ListSearch() {
  return (
    <>
      <Box>
        <Typography
          className="text-f12 text-gray2 box-gray2 fw-700"
          style={{ padding: "2px 10px" }}
        >
          Monday January 1st, 2021
        </Typography>
      </Box>
      <DataGrid
        // rowHeight={32}
        // className={classes.root}
        rows={rows}
        columns={columns}
        // pageSize={100}
        checkboxSelection
        onCellClick={handleCellClick}
        onRowClick={handleRowClick}
        disableSelectionOnClick
        hideFooter
        disableColumnMenu
        autoHeight
        components={{
          ColumnSortedAscendingIcon: () => (
            <KeyboardArrowUpOutlinedIcon
              style={{ fontSize: 12, color: "#fff" }}
            />
          ),
          ColumnSortedDescendingIcon: () => (
            <KeyboardArrowDownOutlinedIcon
              style={{ fontSize: 12, color: "#fff" }}
            />
          ),
          // Checkbox: (props) => <div>{...props}</div>
        }}
      />
    </>
  );
}
