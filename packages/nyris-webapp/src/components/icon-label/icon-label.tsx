import React, { useEffect, useState } from 'react';
import { ReactComponent as RemoveIcon } from 'common/assets/icons/minus.svg';
import { ReactComponent as AddIcon } from 'common/assets/icons/add.svg';

export type LabelPosition = 'bottom' | 'left' | 'right' | 'top';

export type IconLabelProps = {
  icon?: any;
  label?: string;
  labelPosition?: LabelPosition;
  className?: string;
  classNameLabel?: string;
};

export default function IconLabel({
  icon,
  label,
  labelPosition = 'bottom',
  className = 'gap-1',
  classNameLabel = '',
}: IconLabelProps) {
  const [tagIcon, setTagIcon] = useState<string>('');
  // let classNamePosition: string;
  // switch (labelPosition) {
  //   case "top":
  //     classNamePosition = "flex-col-reverse";
  //     break;
  //   case "left":
  //     classNamePosition = "flex-row-reverse";
  //     break;
  //   case "right":
  //     classNamePosition = "flex-row";
  //     break;
  //   case "bottom":
  //   default:
  //     classNamePosition = "flex-col";
  //     break;
  // }
  useEffect(() => {
    setTagIcon(icon);
  }, [icon]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingRight: '2px',
      }}
    >
      {label && (
        <div className={classNameLabel}>
          <p
            style={{
              fontSize: 12,
              color: '#2B2C46',
              fontWeight: 500,
            }}
          >
            {label}
          </p>
        </div>
      )}
      {tagIcon === 'remove' ? (
        <RemoveIcon width={16} height={16} />
      ) : (
        <AddIcon width={16} height={16} />
      )}
    </div>
  );
}
