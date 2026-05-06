import { RotateCcw, Search, Wrench } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import Tooltip from 'components/Tooltip/TooltipComponent';
import { Icon } from '@nyris/nyris-react-components';

export type ChatOption = {
  action_type: string;
  label: string;
  value?: string;
};

type OptionChipProps = {
  option: ChatOption;
  onClick: (option: ChatOption) => void | Promise<void>;
  disabled?: boolean;
};

function OptionChip({ option, onClick, disabled = false }: OptionChipProps) {
  const isRestoreOriginal = option.action_type === 'restore_original';
  const isFilter = option.action_type === 'filter';
  const isRelatedPart =
    option.action_type === 'related_part' ||
    option.action_type === 'find_related_parts';
  const isCatalogSearchImage = option.action_type === 'catalog_search_image';
  const isCatalogSearchText = option.action_type === 'catalog_search_text';
  const displayText =
    isFilter && option.value?.trim() ? option.value : option.label;

  return (
    <Tooltip content={displayText} disabled={displayText.length <= 32}>
      <button
        onClick={() => onClick(option)}
        disabled={disabled}
        className={twMerge(
          'px-2 py-1.5 text-xs font-medium rounded-full',
          'transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          'bg-[#FFFFFF] font-semibold',
          'border border-[#DDDEE7] text-[#767A9F] hover:bg-[#545987] hover:text-[#F3F4F8]',
          'max-line-1',
          'h-8',
          isRelatedPart &&
            'border border-[#E67E22] text-[#E67E22] bg-[#FFF8F0] hover:bg-[#E67E22] hover:text-white',
          (isRestoreOriginal || isCatalogSearchImage || isCatalogSearchText) &&
            'border border-[#C7D2FE] bg-[#EEF2FF] text-[#3E36DC] hover:bg-[#E0E7FF] hover:text-[#2F29B7]',
        )}
      >
        {isCatalogSearchImage && (
          <div className="pr-1 inline ">
            <Icon
              name="camera_simple"
              className="inline shrink-0 w-[12px] h-[12px]"
            />
          </div>
        )}
        {isCatalogSearchText && (
          <div className="pr-1 inline ">
            <Search size={11} className="inline shrink-0" />
          </div>
        )}
        {isRestoreOriginal && (
          <div className="pr-1 inline">
            <RotateCcw size={11} className="inline shrink-0" />
          </div>
        )}
        {isRelatedPart && (
          <div className="inline pr-1">
            <Wrench size={11} className="inline shrink-0" />
          </div>
        )}
        <span>{displayText}</span>
      </button>
    </Tooltip>
  );
}

export default OptionChip;
