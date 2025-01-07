import { useTranslation } from 'react-i18next';

const LoadingSvg = () => {
  return (
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
        d="M75 150C116.421 150 150 116.421 150 75C150 33.5786 116.421 0 75 0C33.5786 0 0 33.5786 0 75C0 116.421 33.5786 150 75 150ZM75 140.367C111.101 140.367 140.367 111.101 140.367 75.0003C140.367 38.8991 111.101 9.63332 75 9.63332C38.8988 9.63332 9.63304 38.8991 9.63304 75.0003C9.63304 111.101 38.8988 140.367 75 140.367Z"
        fill="url(#paint0_linear_2236_26778)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2236_26778"
          x1={75}
          y1={0}
          x2={75}
          y2={150}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E36DC" />
          <stop offset={0.916667} stopColor="#1E1F31" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Loading = () => {
  const { t } = useTranslation();
  return (
    <div
      className="loadingSpinCT"
      style={{
        top: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 16,
          color: '#fff',
          fontWeight: 300,
        }}
      >
        {t('loading')}
      </p>
      <LoadingSvg />
    </div>
  );
};

export default Loading;
