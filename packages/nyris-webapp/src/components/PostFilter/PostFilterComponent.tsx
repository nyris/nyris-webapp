import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import PostFilter from './PostFilter';
import PostFilterFindApi from './PostFilterFindApi';

function PostFilterComponent({ className }: { className?: string }) {
  const [accordionValues, setAccordionValues] = useState([
    ...window.settings.refinements?.map(
      (refinement: any) => refinement.attribute,
    ),
    'expand',
  ]);

  const isExpanded = useMemo(
    () => accordionValues.includes('expand'),
    [accordionValues],
  );

  const { t } = useTranslation();

  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});

  const handleVisibilityChange = useCallback(
    (attribute: string, isVisible: boolean) => {
      setVisibleSections(prev =>
        prev[attribute] === isVisible
          ? prev
          : { ...prev, [attribute]: isVisible },
      );
    },
    [],
  );

  const hasVisibleSections = useMemo(
    () => Object.values(visibleSections).some(Boolean),
    [visibleSections],
  );

  const visibleAttributes = useMemo(() => {
    return window.settings.refinements
      .map((refinement: { attribute: string }) => refinement.attribute)
      .filter((attribute: string | number) => visibleSections[attribute]);
  }, [visibleSections]);

  return (
    <div
      className={twMerge([
        'mt-4',
        'w-full',
        'px-1',
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
        {hasVisibleSections && (
          <AccordionItem value={'expand'}>
            <AccordionTrigger className="text-xs font-normal w-full h-8 items-center justify-end gap-2 border-b border-solid border-[#e0e0e0]">
              {isExpanded ? t('Collapse all') : t('Expand all')}
            </AccordionTrigger>
          </AccordionItem>
        )}
        {window.settings.refinements.map(
          (
            refinement: { attribute: string; header: any; searchable: any },
            index: React.Key | null | undefined,
          ) => {
            const isLastVisible =
              visibleAttributes[visibleAttributes.length - 1] ===
              refinement.attribute;

            return (
              <React.Fragment key={index}>
                {window.settings.algolia.enabled && (
                  <PostFilter
                    attribute={refinement.attribute}
                    label={refinement.header}
                    searchable={refinement.searchable}
                    onVisibilityChange={handleVisibilityChange}
                    isLastVisible={isLastVisible}
                  />
                )}

                {!window.settings.algolia.enabled && (
                  <PostFilterFindApi
                    attribute={refinement.attribute}
                    label={refinement.header}
                    searchable={false}
                    onVisibilityChange={handleVisibilityChange}
                    isLastVisible={isLastVisible}
                  />
                )}
              </React.Fragment>
            );
          },
        )}
      </Accordion>
    </div>
  );
}

export default PostFilterComponent;
