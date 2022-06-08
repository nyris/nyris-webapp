import React, { useEffect, useState } from "react";
export type DynamicWidgetsProps = {
  children: React.ReactNode;
  enabled?: boolean;
  [index: string]: any;
};

export function DynamicWidgetsCT({
  children,
  enabled = true,
  ...props
}: DynamicWidgetsProps): JSX.Element {
  const [isOpen, setOpen] = useState<boolean>();
  useEffect(() => {
    setOpen(enabled);
  }, [enabled]);

  return isOpen ? <div {...props}>{children}</div> : <></>;
}
