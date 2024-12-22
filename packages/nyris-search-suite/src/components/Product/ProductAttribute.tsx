import React from 'react';

interface Props {
  title: any;
  value: any;
  padding?: string;
  backgroundColor?: string;
  isTitleVisible?: boolean;
}

function ProductAttribute(props: Props) {
  const {
    title,
    value,
    padding = props.padding || '4px 16px',
    isTitleVisible = typeof props.isTitleVisible === 'boolean'
      ? props.isTitleVisible
      : true,
  } = props;

  return (
    <div
      className="item-attribute"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 2,
        height: '36px',
        backgroundColor: props.backgroundColor || '#E0E0E0',
        padding: padding,
      }}
    >
      {isTitleVisible ? (
        <div
          style={{
            color: '#2B2C46',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          className="text-xs font-semibold"
        >
          {title}
        </div>
      ) : (
        ''
      )}

      <div
        style={{
          color: '#2B2C46',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        className="text-xs font-normal"
      >
        {value || '-'}
      </div>
    </div>
  );
}

export default ProductAttribute;
