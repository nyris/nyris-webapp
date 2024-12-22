import { Icon } from '@nyris/nyris-react-components';

export default function Footer() {
  return (
    <div
      className="bg-[#fff] hover:bg-[#F0EFFF] group flex-shrink-0"
      style={{
        display: 'flex',
        padding: '9px 0px',
        justifyContent: 'center',
        borderTop: '1px solid #E0E0E0',
      }}
    >
      <Icon
        className="fill-primary group-hover:fill-[url(#powered_by_nyris_colored_svg__gradient)]"
        name="powered_by_nyris"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          window.open('https://www.nyris.io', '_blank');
        }}
        width={80}
        height={10}
      />
    </div>
  );
}
