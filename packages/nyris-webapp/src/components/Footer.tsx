import { useLocation } from 'react-router';
import { Icon } from '@nyris/nyris-react-components';
import { twMerge } from 'tailwind-merge';

export default function Footer({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <div
      className={twMerge(
        'bg-white desktop:hover:bg-[#F0EFFF] group flex-shrink-0 py-2 justify-center desktop:border-t border-solid border-[#E0E0E0] flex',
        className,
      )}
    >
      <Icon
        className="fill-[#aaabb5] desktop:fill-primary group-hover:fill-[url(#powered_by_nyris_colored_svg__gradient)] cursor-pointer w-24 h-4"
        name="powered_by_nyris"
        onClick={() => {
          window.open('https://www.nyris.io', '_blank');
        }}
      />
    </div>
  );
}
