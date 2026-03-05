import { Icon } from '@nyris/nyris-react-components';
import { twMerge } from 'tailwind-merge';

export default function PoweredBy({ className }: { className?: string }) {
  return (
    <div className={twMerge(className)}>
      <Icon
        className="fill-[#767A9F] group-hover:fill-[url(#powered_by_nyris_colored_svg__gradient)] hover:fill-[url(#powered_by_nyris_colored_svg__gradient)] cursor-pointer w-[110px] h-5"
        name="powered_by_nyris"
        onClick={() => {
          window.open('https://www.nyris.io', '_blank');
        }}
      />
    </div>
  );
}
