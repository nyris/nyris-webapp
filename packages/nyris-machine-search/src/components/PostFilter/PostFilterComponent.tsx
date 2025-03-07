import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import React, { useState } from 'react';
import PostFilter from './PostFilter';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

function PostFilterComponent({ className }: { className?: string }) {
  const [accordionValues, setAccordionValues] = useState([
    ...window.settings.refinements?.map(
      (refinement: any) => refinement.attribute,
    ),
    'expand',
  ]);

  const isExpanded = React.useMemo(
    () => accordionValues.includes('expand'),
    [accordionValues],
  );

  const { t } = useTranslation();

  return (
    <div
      className={twMerge([
        'mt-4',
        'w-full',
        'px-6',
        'flex',
        'flex-col',
        'gap-4',
        className,
      ])}
    >
      <Accordion
        type="multiple"
        onValueChange={val => {
          if (
            val.length === window.settings.refinements.length &&
            !val.includes('expand') &&
            !accordionValues.includes('expand')
          ) {
            setAccordionValues([...val, 'expand']);
            return;
          }

          if (
            val.length === 1 &&
            val.includes('expand') &&
            accordionValues.length >= 1
          ) {
            setAccordionValues([]);
            return;
          }

          if (!val.includes('expand') && accordionValues.includes('expand')) {
            setAccordionValues([]);
          } else if (
            val.includes('expand') &&
            !accordionValues.includes('expand')
          ) {
            setAccordionValues([
              ...window.settings.refinements?.map(
                (refinement: any) => refinement.attribute,
              ),
              'expand',
            ]);
          } else {
            setAccordionValues(val);
          }
        }}
        value={accordionValues}
      >
        <AccordionItem value={'expand'}>
          <AccordionTrigger className="text-xs font-normal w-full h-8 items-center justify-end gap-2 border-b border-solid border-[#e0e0e0]">
            {isExpanded ? t('Collapse all') : t('Expand all')}
          </AccordionTrigger>
        </AccordionItem>
        {window.settings.refinements.map(
          (
            refinement: { attribute: string; header: any; searchable: any },
            index: React.Key | null | undefined,
          ) => {
            return (
              <div
                key={index}
                className={twMerge([
                  index !== window.settings.refinements.length - 1 &&
                    'border-b border-solid border-[#e0e0e0]',
                  'py-4',
                ])}
              >
                <PostFilter
                  attribute={refinement.attribute}
                  label={refinement.header}
                  searchable={refinement.searchable}
                />
              </div>
            );
          },
        )}
      </Accordion>
    </div>
  );
}

export default PostFilterComponent;
