import React from "react";
import { makeStyles, Typography, Link } from "@material-ui/core";
import { useAppSelector } from "Store/Store";

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Powered by "}
      <Link
        color="inherit"
        href="https://nyris.io/"
        component="a"
        target="_blank"
      >
        nyris.io
      </Link>
    </Typography>
  );
}

function FooterMD(): JSX.Element {
  const searchState = useAppSelector((state) => state);
  const { search, nyris } = searchState;
  const { showPart } = nyris;
  const { requestId } = search;
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <Typography variant="subtitle1" align="center" color="textSecondary">
        {requestId && showPart === "results" && (
          <div
            style={{
              textAlign: "center",
              fontSize: "0.7em",
              paddingTop: "0.8em",
            }}
          >
            Request identifier {requestId}
          </div>
        )}
      </Typography>
      <Copyright />
    </footer>
  );
}

export default FooterMD;
