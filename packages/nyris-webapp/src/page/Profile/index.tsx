import React from "react";
import { Box, Button, FormControlLabel, Grid, Typography } from "@material-ui/core";
import BgColor from "common/assets/images/Rectangle.png";

interface Props {}

function Profile(props: Props) {
  return (
    <Box className="wrap-main-profile">
      <Grid container>
        <Grid item xs={6} className="box-col-left">
          <Box className="box-top">
            <Typography className="text-f40 fw-600 text-dark">
              Jose Luis Reyes
            </Typography>
            <Typography className="text-f13 text-dark2 fw-600">
              Nyris GmbH
            </Typography>
          </Box>
          <Box className="box-bottom">
            <Box className="box-content">
              <Typography className="text-f12 text-dark fw-700">Profile</Typography>
              <Box mt={1}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<input />}
                  label="Name"
                  className="w-100"
                  style={{ alignItems: "flex-start", margin: 0 }}
                />
              </Box>
              <Box mt={1}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<input />}
                  label="E-mail"
                  style={{ alignItems: "flex-start", margin: 0 }}
                  className="w-100"
                />
              </Box>
              <Box mt={1}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<input />}
                  label="Password"
                  style={{ alignItems: "flex-start", margin: 0 }}
                  className="w-100"
                />
              </Box>
              <Box className="w-100" mt={2}>
                <Typography className="text-f12 text-dark fw-700">Account</Typography>
              </Box>
              <Box mt={1}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<input />}
                  label="Company"
                  style={{ alignItems: "flex-start", margin: 0 }}
                  className="w-100"
                />
              </Box>
              <Box mt={1}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<input />}
                  label="Role"
                  style={{ alignItems: "flex-start", margin: 0 }}
                  className="w-100"
                />
              </Box>
              <Box mt={2}>
              <Button className="btn-log-out">Log out</Button>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} className="box-col-right">
          <Box className="box-bg-image">
            <img src={BgColor} alt="" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;