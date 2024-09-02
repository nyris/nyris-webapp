import { useRef, useState } from "react";
import classNames from "classnames";

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  arrow,
  useMergeRefs,
  FloatingArrow,
} from "@floating-ui/react";
import React from "react";

const ARROW_WIDTH = 15;
const ARROW_HEIGHT = 7;

interface TooltipProps {
  content?: React.ReactNode;
  children: JSX.Element;
  tooltipClassName?: string | string[];
  enabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLElement, TooltipProps>(
  ({ content, children, tooltipClassName, enabled = true, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: "top",
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(5),
        flip({
          fallbackAxisSideDirection: "start",
        }),
        shift(),
        arrow({ element: arrowRef }),
      ],
    });

    // Event listeners to change the open state
    const hover = useHover(context, { move: false, enabled: enabled });
    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    // Role props for screen readers
    const role = useRole(context, { role: "tooltip" });

    // Merge all the interactions into prop getters
    const { getReferenceProps, getFloatingProps } = useInteractions([
      hover,
      focus,
      dismiss,
      role,
    ]);

    const ref = useMergeRefs([refs.setReference, (children as any).ref]);

    return (
      <>
        {React.cloneElement(
          children,
          getReferenceProps({
            ref,
            ...props,
            ...children.props,
          })
        )}

        <FloatingPortal>
          {isOpen && (
            <div
              className={classNames([
                "bg-slate-900",
                "px-2",
                "py-1",
                "rounded-3xl",
                "text-xs",
                "text-white",
              ])}
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {content}
              <FloatingArrow
                ref={arrowRef}
                context={context}
                width={ARROW_WIDTH}
                height={ARROW_HEIGHT}
              />
            </div>
          )}
        </FloatingPortal>
      </>
    );
  }
);
