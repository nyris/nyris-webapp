import { Grid } from '@material-ui/core';
import React from 'react';
import { connectPagination } from 'react-instantsearch-dom';

function Pagination({ children }: any) {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      style={{ height: '100%' }}
    >
      {children}

      {/* <Grid item className="item-notify">
        <Typography className="text-f12 text-center">
          <span className="fw-600" style={{ color: '#2B2C46' }}>
            Didn’t find what you were looking for?
          </span>
          <span style={{ color: '#2B2C46' }}>Share your search with our</span>
          <Link
            to={'/support'}
            style={{ color: settings.themePage.searchSuite?.secondaryColor }}
          >
            product experts
          </Link>
        </Typography>
      </Grid> */}
      <Grid item className="item-notify-right" style={{ minWidth: 32 }}></Grid>
    </Grid>
  );
}
const FooterResult = connectPagination(Pagination);

export default FooterResult;
