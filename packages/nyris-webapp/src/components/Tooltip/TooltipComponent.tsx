import React from 'react';
import {
  RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip';
import { TooltipArrow } from '@radix-ui/react-tooltip';

function Tooltip({
  content,
  children,
  disabled,
  sideOffset,
}: {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
  sideOffset?: number;
}) {
  return (
    <TooltipProvider delayDuration={80}>
      <RadixTooltip open={disabled ? false : undefined}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent sideOffset={sideOffset}>
          <TooltipArrow />
          <p className="text-white max-w-[350px]">{content}</p>
        </TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  );
}

export default Tooltip;
