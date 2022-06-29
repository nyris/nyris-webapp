import React from "react";
import { withStyles, Theme, createStyles, Switch } from "@material-ui/core";

export const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 32,
      height: 16,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      left: 2,
      margin: "auto",
      bottom: 0,
      "&$checked": {
        transform: "translateX(16px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#24A148",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#52d869",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: 10,
      height: 10,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: "#8D8D8D",
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  })
)(({ classes, ...props }: any) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});
