import React, { useState } from 'react';
import { ReactComponent as PoweredByNyrisImage } from 'common/assets/images/powered_by_nyris.svg';
import { ReactComponent as PoweredByNyrisImageColored } from 'common/assets/images/powered_by_nyris_colored.svg';

function PoweredByNyris() {
  const [isHovered, setHovered] = useState(false);

  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  return (
    <div
      className="powered-by-nyris"
      style={{
        display: 'flex',
        padding: '9px 0px',
        justifyContent: 'center',
        borderTop: '1px solid #E0E0E0',
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {isHovered && (
        <PoweredByNyrisImageColored
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.open('https://www.nyris.io', '_blank');
          }}
        />
      )}
      {!isHovered && (
        <PoweredByNyrisImage
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.open('https://www.nyris.io', '_blank');
          }}
          color="#2B2C46"
        />
      )}
    </div>
  );
}

export default PoweredByNyris;
