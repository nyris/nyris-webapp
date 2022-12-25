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
    <div
      type="native"
      className={className}
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '2px 4px 2px 4px',
        backgroundColor: '#e4e4e58f',
        borderRadius: '5px',
      }}
    >
      {children}
      {closeIcon && (
        <CloseOutlinedIcon style={{ fontSize: '16px', fontWeight: 'bold' }} />
      )}
    </div>
  );
}
