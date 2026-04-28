import ItemSpecification from './ItemSpecification';
import { Icon } from '@nyris/nyris-react-components';

function SmartFilter({
  imageAnalysis,
  specificationFilter,
}: {
  imageAnalysis?: any;
  specificationFilter?: any;
}) {
  return (
    <div>
      <div className="flex gap-2 ml-[30px]">
        <div className="text-[#3B3E5F] font-bold text-sm">
          Smart generated filters
        </div>
        <Icon name="smart_filter_indication" className="mt-1" />
      </div>
      <div className="flex flex-wrap mx-4 gap-2 mt-4">
        {Object.keys(imageAnalysis?.specification || {})
          .filter(key => key !== 'is_nameplate' && key !== 'prefilter_value')
          .map(key => {
            const value = imageAnalysis?.specification[key];
            if (!value) {
              return null;
            }
            return (
              <ItemSpecification
                key={key}
                attr={key}
                value={value}
                specificationFilter={specificationFilter}
                imageAnalysis={imageAnalysis}
              />
            );
          })}
      </div>
    </div>
  );
}

export default SmartFilter;
