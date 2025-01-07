import { useTranslation } from 'react-i18next';
import { useClearRefinements } from 'react-instantsearch';

import { Icon } from '@nyris/nyris-react-components';

import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { twMerge } from 'tailwind-merge';

export const GoBackButton = ({ className }: { className?: string }) => {
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);

  const requestImages = useRequestStore(state => state.requestImages);
  const setPreFilter = useRequestStore(state => state.setPreFilter);
  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const resetRegions = useRequestStore(state => state.resetRegions);
  const firstSearchImage = useRequestStore(state => state.firstSearchImage);
  const firstSearchPreFilter = useRequestStore(
    state => state.firstSearchPreFilter,
  );
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);

  const { refine: clearPostFilters } = useClearRefinements();

  const { t } = useTranslation();

  const onGoBack = () => {
    setFindApiProducts(firstSearchResults);
    if (firstSearchImage) {
      setRequestImages([firstSearchImage]);
    }

    const nonEmptyFilter: any[] = ['sku:DOES_NOT_EXIST<score=1> '];
    const filterSkus: any = firstSearchResults
      ? firstSearchResults
          .slice()
          .reverse()
          .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
      : '';
    const filterSkusString = [...nonEmptyFilter, ...filterSkus].join('OR ');

    setAlgoliaFilter(filterSkusString);

    setPreFilter(firstSearchPreFilter);
    resetRegions();
    clearPostFilters();
  };

  if (firstSearchResults.length === 0 || requestImages[0] === firstSearchImage)
    return <></>;

  return (
    <div
      className={twMerge([
        'p-2',
        'rounded-2xl',
        'w-max',
        'flex',
        'flex-row',
        'gap-2',
        'items-center',
        'cursor-pointer',
        'font-source-sans-3',
        'text-xs',
        'font-normal',
        'leading-4',
        'hover:bg-[#F3F3F5]',
        'bg-[#F3F3F5]',
        'desktop:bg-transparent',
        className,
      ])}
      onClick={() => onGoBack()}
    >
      <Icon name="back" />
      {t('Back to request image')}
    </div>
  );
};
