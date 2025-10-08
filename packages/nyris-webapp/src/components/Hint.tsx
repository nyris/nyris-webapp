import React from 'react';
import { Icon } from '@nyris/nyris-react-components';

const Hint = () => (
  <div
    style={{
      width: 240,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      fontSize: 9,
      fontWeight: 700,
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Icon
        name="typeplate"
        width={24}
        height={24}
        style={{
          marginBottom: 8,
        }}
      />
      Type plates
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Icon
        name="part"
        width={24}
        height={24}
        style={{
          marginBottom: 8,
        }}
      />
      Parts
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Icon
        name="label"
        width={24}
        height={24}
        style={{
          marginBottom: 8,
        }}
      />
      Labels
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Icon
        name="barcode"
        width={24}
        height={24}
        style={{
          marginBottom: 8,
        }}
      />
      Barcodes
    </div>
  </div>
);

export default Hint;