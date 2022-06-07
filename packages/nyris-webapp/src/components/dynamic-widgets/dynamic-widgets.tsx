import React from "react";
import { ExperimentalDynamicWidgets } from "react-instantsearch-dom";
export type DynamicWidgetsProps = {
  children: React.ReactNode;
  enabled?: boolean;
  [index: string]: any;
};

export function DynamicWidgets({
  children,
  enabled = true,
  ...props
}: DynamicWidgetsProps): JSX.Element {
  console.log('children', children);
  
  return enabled ? (
    <div {...props}>
      {children}
    </div>
  ) : (
    <div {...props}>
     {children}
    </div>
  );
}
