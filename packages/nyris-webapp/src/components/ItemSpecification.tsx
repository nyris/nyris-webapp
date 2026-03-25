import { useRefinementList } from 'react-instantsearch';
import Tooltip from './Tooltip/TooltipComponent';
import { twMerge } from 'tailwind-merge';
import useRequestStore from '../stores/request/requestStore';
import useResultStore from '../stores/result/resultStore';
import { Icon } from '@nyris/nyris-react-components';
import { useMediaQuery } from 'react-responsive';

const ItemSpecification = ({
  attr,
  value,
  specificationFilter,
  imageAnalysis,
}: any) => {
  const refinement = window.settings.refinements.filter((ref: any) => {
    return ref.header.toLocaleLowerCase() === attr.toLocaleLowerCase();
  });
  const attribute = refinement?.length ? refinement[0].attribute : 'none';
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { refine } = useRefinementList({
    attribute,
    operator: 'or',
    showMore: false,
    limit: 1,
  });

  return isMobile ? (
    <>
      <div
        className="inline-flex flex-col justify-center items-start "
        key={attr}
      >
        <div className="pl-1 inline-flex justify-center items-center gap-2.5">
          <div className="justify-start text-[#3B3E5F] text-sm font-semibold">
            {attr}
          </div>
        </div>
        <div
          className={twMerge(
            `p-3 bg-[#e4e3ff] rounded-lg  inline-flex justify-center items-center gap-1.5`,
            'text-[#3e36dc]',
            specificationFilter[attr]
              ? 'border-[#3E36DC] bg-[#3E36DC] text-white'
              : '',
          )}
          onClick={() => {
            if (!value) {
              return;
            }
            if (attribute !== 'none') {
              refine(value);
            } else {
              const setSpecificationFilter =
                useRequestStore.getState().setSpecificationFilter;

              const setSpecificationFilteredProducts =
                useResultStore.getState().setSpecificationFilteredProducts;

              if (specificationFilter[attr]) {
                setSpecificationFilter({});
                setSpecificationFilteredProducts([]);
                // setProducts(results);
              } else {
                setSpecificationFilter({
                  [attr]: value,
                });
              }
            }
          }}
        >
          <div className="justify-start text-sm font-medium leading-none flex gap-2">
            {imageAnalysis?.specification[attr] || 'N/A'}
            <div>
              <Icon
                name="close"
                className={twMerge(
                  'w-3 h-3 text-white',
                  specificationFilter[attr] ? 'block' : 'hidden',
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Tooltip
      content={
        specificationFilter[attr]
          ? 'Filter applied. Clear to choose a different value.'
          : 'Click to apply as a search filter.'
      }
      delayDuration={1000}
      disabled={!value}
    >
      <div
        className={twMerge(
          `px-3.5 py-2 bg-[#E7E8F1] rounded-lg flex justify-center items-center gap-1.5`,
          'border border-solid border-transparent hover:border-[#E7E8F1]',
          'cursor-pointer',
          'w-fit',
          specificationFilter[attr]
            ? ' bg-[#545987] '
            : 'hover:shadow-[0_0_6px_0_#DDDEE7]',
        )}
        onClick={() => {
          if (!value) {
            return;
          }
          if (attribute !== 'none') {
            refine(value);
          } else {
            const setSpecificationFilter =
              useRequestStore.getState().setSpecificationFilter;

            const setSpecificationFilteredProducts =
              useResultStore.getState().setSpecificationFilteredProducts;

            if (specificationFilter[attr]) {
              setSpecificationFilter({});
              setSpecificationFilteredProducts([]);
              // setProducts(results);
            } else {
              setSpecificationFilter({
                [attr]: value,
              });
            }
          }
        }}
      >
        <div
          className={twMerge(
            'justify-start text-[#767A9F] text-sm leading-none px-0.5',
            'font-normal',
            specificationFilter[attr]
              ? 'text-white hover:px-0.5'
              : 'hover:font-semibold',
            'leading-4',
            'flex gap-2 items-center',
          )}
        >
          {imageAnalysis?.specification[attr] || 'N/A'}

          <Icon
            name="close"
            className={twMerge(
              'w-[10px] h-[10px] text-white',
              specificationFilter[attr] ? 'block' : 'hidden',
            )}
          />
        </div>
      </div>
    </Tooltip>
  );
};

export default ItemSpecification;
