import React, { useEffect } from 'react';

interface GroundingSpec {
  label: string;
  value: string;
}

const GroundingSpecs = ({ data }: { data: any }) => {
  // Mapping the complex JSON object to the flat GroundingSpec interface
  const [specs, setSpecs] = React.useState<GroundingSpec[]>([]);

  useEffect(() => {
    const newSpecs: GroundingSpec[] = [];
    if (data.product_name) {
      newSpecs.push({ label: 'Product Name', value: data.product_name });
    }
    if (data.brand) {
      newSpecs.push({ label: 'Brand', value: data.brand });
    }
    if (data.category) {
      newSpecs.push({ label: 'Category', value: data.category });
    }
    // Dynamically mapping the nested key_specs
    Object.entries(data.key_specs || {}).forEach(([key, val]) => {
      newSpecs.push({ label: key, value: String(val) });
    });
    setSpecs(newSpecs);
  }, [data]);

  return (
    <div className="flex flex-col text-[10px] leading-4">
      {specs.map((spec, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 py-[3px] pl-2 rounded-sm ${
            index % 2 === 0 ? 'bg-[#F3F4F8]' : 'bg-white'
          }`}
        >
          <div className="w-1/3 text-[#3B3E5F] font-semibold">{spec.label}</div>
          <div className="w-2/3 text-[#3B3E5F]">{spec.value}</div>
        </div>
      ))}
    </div>
  );
};

export default GroundingSpecs;
