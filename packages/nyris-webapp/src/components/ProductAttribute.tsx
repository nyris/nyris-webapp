import { Typography, Tooltip } from '@material-ui/core';
import React from 'react';

interface Props {
  title: any;
  value: any;
  padding?: string;
  width?: any;
  backgroundColor?: string;
  isTitleVisible?: boolean;
  maxWidth?: string;
}

function ProductAttribute(props: Props) {
  const {
    title,
    value,
    padding = props.padding || '4px 16px',
    width = props.width || 'fit-content',
    isTitleVisible = typeof props.isTitleVisible === 'boolean' ? props.isTitleVisible : true,
    maxWidth
  } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 2,
        width: width,
        height: '36px',
        maxWidth: maxWidth || 'fit-content',
        backgroundColor: props.backgroundColor || '#E0E0E0',
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
          className="text-f12 fw-600"
        >
          {title}
        </Typography>
      ) : (
        '' 
      )}
      <Tooltip
        title={value}
        placement="top"
        arrow={true}
      >
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
      </Tooltip>
    </div>
  );
}

export default ProductAttribute;
