import { Icon } from '@nyris/nyris-react-components';

export default function Footer() {
  return (
    <div className="bg-white desktop:hover:bg-[#F0EFFF] group flex-shrink-0 flex py-2 justify-center desktop:border-t border-solid border-[#E0E0E0]">
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
