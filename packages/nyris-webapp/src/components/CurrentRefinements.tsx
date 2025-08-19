import {
  useClearRefinements,
  useCurrentRefinements,
} from 'react-instantsearch';

import { Icon } from '@nyris/nyris-react-components';
import { twMerge } from 'tailwind-merge';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';

function CurrentRefinements({ className }: { className?: string }) {
  const { items, refine } = useCurrentRefinements();

  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );

  const { refine: clearRefinements } = useClearRefinements();

  const filterApplied =
    Object.keys(specificationFilter || {}).length > 0 || items.length > 0;

  if (!filterApplied) return <></>;

  return (
    <div className={twMerge('mx-1 gap-2 hidden desktop:flex', className)}>
      {Object.values(specificationFilter || {}).map(value => {
        return (
          <div
            key={value}
            className="h-6 pl-2 pr-0.5 py-0.5 bg-[#f3f3f5] rounded-[1px] border border-solid border-[#e0e0e0] justify-start items-center gap-2 inline-flex"
          >
            <div className="text-[#2b2c46] text-xs font-normal ">{value}</div>
            <div className="w-5 h-5 rounded-sm justify-center items-center flex cursor-pointer">
              <Icon
                name="close"
                className="w-3 h-3"
                onClick={() => {
                  const setSpecificationFilter =
                    useRequestStore.getState().setSpecificationFilter;
                  setSpecificationFilter({});

                  const setSpecificationFilteredProducts =
                    useResultStore.getState().setSpecificationFilteredProducts;

                  setSpecificationFilteredProducts([]);
                }}
              />
            </div>
          </div>
        );
      })}
      {items.map(item => (
        <div
          key={[item.indexName, item.label].join('/')}
          className="flex gap-2"
        >
          {item.refinements.map(refinement => (
            <div
              key={refinement.label}
              className="h-6 pl-2 pr-0.5 py-0.5 bg-[#f3f3f5] rounded-[1px] border border-solid border-[#e0e0e0] justify-start items-center gap-2 inline-flex"
            >
              <div className="text-[#2b2c46] text-xs font-normal ">
                {refinement.label}
              </div>
              <div className="w-5 h-5 rounded-sm justify-center items-center flex cursor-pointer">
                <Icon
                  name="close"
                  className="w-3 h-3"
                  onClick={() => refine(refinement)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
      {filterApplied && (
        <div
          className="h-6 px-2 py-1 bg-neutral-50 rounded-2xl justify-center items-center inline-flex cursor-pointer"
          onClick={() => {
            const setSpecificationFilter =
              useRequestStore.getState().setSpecificationFilter;
            setSpecificationFilter({});

            clearRefinements();
          }}
        >
          <div className="text-[#e31b5d] text-[13px] font-normal">
            Clear all
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentRefinements;
