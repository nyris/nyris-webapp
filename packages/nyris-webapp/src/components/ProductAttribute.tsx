import { Box, Typography } from '@material-ui/core';
import React from 'react';

interface Props {
  title: any;
  value: any;
  padding?: string;
  width?: any;
}

function ProductAttribute(props: Props) {
  const {
    title,
    value,
    padding = props.padding || '4px 16px',
    width = props.width || 'fit-content',
  } = props;

  return (
    <>
      {title && (
        <Box
          display="flex"
          flexDirection={'column'}
          borderRadius={2}
          width={width}
          style={{
            backgroundColor: '#E0E0E0',
            padding: padding,
            flexGrow: 1,
          }}
        >
          <Typography
            style={{
              color: '#2B2C46',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            className="text-f12 fw-700"
          >
            {title}
          </Typography>
          <Typography
            style={{
              color: '#2B2C46',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            className="text-f12 fw-400"
          >
            {value}
          </Typography>
        </Box>
      )}
    </>
  );
}

export default ProductAttribute;
