import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

const LoadingSpinner = () => (
  <svg
    width={150}
    height={150}
    viewBox="0 0 150 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="loading-spinner"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M75 150C116.421 150 150 116.421 150 75C150 33.5787 116.421 1.31134e-05 75 1.31134e-05C33.5787 1.31134e-05 1.31134e-05 33.5787 1.31134e-05 75C1.31134e-05 116.421 33.5787 150 75 150ZM75 145C113.66 145 145 113.66 145 75C145 36.3401 113.66 5.00001 75 5.00001C36.3401 5.00001 5.00001 36.3401 5.00001 75C5.00001 113.66 36.3401 145 75 145Z"
      fill="url(#paint0_linear_3392_14489)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_3392_14489"
        x1={75}
        y1={0}
        x2={75}
        y2={150}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#D3D1FF" />
        <stop offset={1} stopColor="white" />
      </linearGradient>
    </defs>
  </svg>
);

function CadenasLoading() {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { t } = useTranslation();
  return (
    <div
      style={{
        borderRadius: '2px',
        background: 'linear-gradient(180deg, #FAFAFA 0%, #E4E3FF 100%)',
        width: '100%',
        height: isMobile ? '368px' : '456px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <p
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {t('loading')}
      </p>
      <LoadingSpinner />
    </div>
  );
}

export default CadenasLoading;
