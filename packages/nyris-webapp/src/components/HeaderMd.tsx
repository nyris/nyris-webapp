import React from "react";
import { Container, Toolbar, Typography, AppBar } from "@material-ui/core";
import { useAppSelector } from "Store/Store";
import {MDSettings} from "../types";
interface Props {
  settings: any;
}

function HeaderMdComponent(): JSX.Element {
  const { settings } = useAppSelector((state) => state);
  const { themePage } = settings;
  const mdSettings = themePage.materialDesign as MDSettings;

  return (
    <AppBar
      position={"relative"}
      style={{ backgroundColor: mdSettings.appBarCustomBackgroundColor }}
    >
      <Container
        maxWidth="md"
        style={{ flexDirection: "row", display: "flex" }}
      >
        <img
          src={mdSettings.appBarLogoUrl}
          style={{ height: "2em", minHeight: "64px", display: "flex" }}
          alt="Logo"
        />
        <Toolbar component="span">
          <Typography style={{ color: mdSettings.appBarCustomTextColor }}>
            {mdSettings.appBarTitle}
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default HeaderMdComponent;
