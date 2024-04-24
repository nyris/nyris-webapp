import React from 'react';
import { Button } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';

export default function ChipComponent({
  children,
  className,
  selected,
  closeIcon = false,
  ...props
}: any) {
  return (
    <Button type="native" className={className} {...props}>
      {children}
      {closeIcon && (
        <CloseOutlinedIcon style={{ fontSize: '16px', fontWeight: 'bold' }} />
      )}
    </Button>
  );
}
