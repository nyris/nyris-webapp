import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Icon } from '@nyris/nyris-react-components';
import { cn } from 'lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {}
>(({ className, children, ...props }, ref) => {
  return (
    <div className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'group flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all text-left',
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          name="minus"
          className="h-2.5 w-2.5 shrink-0 text-muted-foreground block group-data-[state=closed]:hidden"
        />
        <Icon
          name="plus"
          className="h-2.5 w-2.5 shrink-0 text-muted-foreground block group-data-[state=open]:hidden"
        />
      </AccordionPrimitive.Trigger>
    </div>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
