import React from "react";
import { Container, Toolbar, Typography, AppBar } from "@material-ui/core";
import { defaultMdSettings } from "defaults";
interface Props {
  settings: any;
}

function HeaderMdComponent(props: Props) {
  const { settings } = props;
  const mdSettings: any = settings.materialDesign
    ? settings.materialDesign
    : defaultMdSettings;
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
