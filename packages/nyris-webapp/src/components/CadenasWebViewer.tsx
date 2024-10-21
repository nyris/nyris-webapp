import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import CadenasLoading from './CadenasLoading';
import { useAppSelector } from '../Store/Store';
import { Icon } from '@nyris/nyris-react-components';

declare const psol: any;

const favoriteActions3d = [
  'actMeasureGrid',
  'actCut',
  'actAnimate',
  'actIsometric',
  'actExternalAR',
];

function CadenasWebViewer({
  is3dView,
  sku,
  setStatus3dView,
  status3dView,
}: {
  status3dView: string | undefined;
  sku: string;
  is3dView: boolean;
  setStatus3dView: any;
}) {
  const [mident, setMident] = useState('');
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { settings } = useAppSelector(state => state);

  useEffect(() => {
    // prepare 3d viewer settings.
    let webViewer3DSettings = {
      $container: $('#cnsWebViewer3d'),
      viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
      devicePixelRatio: window.devicePixelRatio,
      radialMenuActions: [],
      favoriteActions: favoriteActions3d,
      showProgressDialog: false,
      webglViewerSettings: {
        ColorTL: '#fff',
        ColorTR: '#fff',
        ColorML: '#fff',
        ColorMR: '#fff',
        ColorBL: '#fff',
        ColorBR: '#fff',
        showLogo: false,
        logoTexture: './img/logo.png',
        logoScaleFactor: 1.0,
        logoMixFactor: 0.5,
        material: {
          preset: 'pcloud',
          edit: false,
        },
        measureGrid: {
          colors: {
            dimensions: '#000000',
            outline: '#0000ff',
            grid: '#757575',
            unit: 'mm',
          },
        },
        helperOptions: {
          gridOn: false,
          axisOn: false,
        },
        shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
        enableEditableDimensions: true,
        showPartNameTooltip: false,
      },
    };

    // initialize 3d viewer
    let webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);
    psol.core.setApiKey(settings.cadenas?.cadenasAPIKey);
    setStatus3dView('loading');
    // run search and display result in 3D viewer.
    psol.core
      .ajaxGetOrPost({
        url: psol.core.getServiceBaseUrl() + '/service/reversemap',
        data: {
          catalog: settings.cadenas?.catalog,
          part: sku,
          exact: '0',
        },
      })
      .then(function (reverseMapResult: { mident: string }) {
        let mident = reverseMapResult.mident || '';
        setMident(mident);
        // load geometry in 3d viewer.
        webviewer3d.show().then(function () {
          webviewer3d
            .loadByVarset(null, null, mident)
            .then(() => {
              setStatus3dView('loaded');
            })
            .catch((err: any) => {
              setStatus3dView('not-found');
            });
        });
      });
  }, [sku, setStatus3dView, settings]);

  const showWebViewer = !is3dView || status3dView !== 'loaded';

  return (
    <>
      {status3dView !== 'not-found' && (
        <div
          id="cnsWebViewer3d"
          style={{
            height: showWebViewer ? '0px' : isMobile ? '368px' : '456px',
            width: '100%',
            opacity: showWebViewer ? 0 : 1,
            transition:
              is3dView && status3dView !== 'loaded' ? 'opacity 2s ease' : '',
          }}
        ></div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '19px',
          right: '26px',
        }}
      >
        {is3dView && status3dView === 'loaded' && (
          <div
            style={{
              background: '#E9E9EC',
              width: '32px',
              height: '32px',
              borderRadius: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              new psol.components.DownloadDialog({
                mident: mident,
              }).show();
            }}
          >
            {/* <DownloadIcon width={14} height={14} className="text-black" /> */}
            <Icon
              name="download"
              width={14}
              height={14}
              className="text-black"
            />
          </div>
        )}
      </div>

      {status3dView === 'loading' && is3dView && <CadenasLoading />}

      {status3dView === 'not-found' && is3dView && (
        <div
          style={{
            height: isMobile ? '368px' : '456px',
            width: '100%',
            color: '#AAABB5',
            background: 'linear-gradient(180deg, #fff 0%, #E9E9EC 100%)',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          No 3D View available for this item
        </div>
      )}
    </>
  );
}

export default CadenasWebViewer;
