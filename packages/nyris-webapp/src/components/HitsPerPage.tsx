import { useTranslation } from 'react-i18next';
import { useHitsPerPage, UseHitsPerPageProps } from 'react-instantsearch';
import PoweredBy from './PoweredBy';
import { twMerge } from 'tailwind-merge';

export const HitsPerPage = (props: UseHitsPerPageProps) => {
  const { items, refine } = useHitsPerPage(props);
  const { value: currentValue } =
    items.find(({ isRefined }) => isRefined)! || {};

  const { t } = useTranslation();

  return (
    <>
      <div
        className={twMerge(
          'w-full min-h-10 bg-[#FFFFFF] border border-solid border-[#DDDEE7] items-center hidden desktop:inline-flex rounded-3xl justify-between pr-4',
          'shadow-ds-1',
        )}
      >
        <div className="self-stretch pl-4 pr-6 border-r border-solid border-[#DDDEE7] justify-center items-center gap-1 flex">
          <div className="text-[#3B3E5F] text-[13px] font-normal font-['Source Sans 3'] leading-none tracking-tight">
            {t('Items per page')}:
          </div>
          <select
            className="bg-transparent text-[13px] outline-none"
            onChange={event => {
              refine(Number(event.target.value));
            }}
            value={String(currentValue)}
          >
            {items.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {window.settings.showPoweredByNyris && <PoweredBy />}
      </div>
    </>
  );
};
