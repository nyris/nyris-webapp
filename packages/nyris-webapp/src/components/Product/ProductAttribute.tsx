import Tooltip from 'components/Tooltip/TooltipComponent';

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
        borderRadius: 6,
        height: '36px',
        backgroundColor: props.backgroundColor || '#F3F3F5',
        padding: padding,
      }}
    >
      {isTitleVisible ? (
        <div
          style={{
            color: '#3B3E5F',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          className="text-xs font-normal"
        >
          {title}
        </div>
      ) : (
        ''
      )}

      <Tooltip content={value} disabled={!value} sideOffset={10}>
        <div
          style={{
            color: '#3B3E5F',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          className="text-xs font-semibold"
        >
          {value || '-'}
        </div>
      </Tooltip>
    </div>
  );
}

export default ProductAttribute;
