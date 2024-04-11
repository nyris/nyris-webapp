import { Typography } from '@material-ui/core';
import React from 'react';

interface Props {
  title: any;
  value: any;
  padding?: string;
  width?: any;
  backgroundColor?: string;
  isTitleVisible?: boolean;
}

function ProductAttribute(props: Props) {
  const {
    title,
    value,
    padding = props.padding || '4px 16px',
    width = props.width || 'fit-content',
    backgroundColor = props.backgroundColor || '#E0E0E0',
    isTitleVisible = typeof props.isTitleVisible === 'boolean' ? props.isTitleVisible : true,
  } = props;

  return (
    <>
      {title && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            width: width,
            backgroundColor,
            padding: padding,
            flexGrow: 1,
          }}
        >
          {isTitleVisible ? (
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
          ) : (
           '' 
          )}
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
        </div>
      )}
    </>
  );
}

export default ProductAttribute;
