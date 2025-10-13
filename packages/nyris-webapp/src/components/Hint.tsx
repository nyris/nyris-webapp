import React from 'react';
import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';

const Hint = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        width: 'max-content',
        minWidth: 240,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        fontSize: 9,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        gap: 16,
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
        {t('Type plates')}
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
        {t('Parts')}
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
        {t('Labels')}
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
        {t('Barcodes')}
      </div>
    </div>
  );
};

export default Hint;