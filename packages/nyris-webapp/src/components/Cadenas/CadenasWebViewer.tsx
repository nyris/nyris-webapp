import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Icon } from '@nyris/nyris-react-components';

import CadenasLoading from './CadenasLoading';
import { CadenasScriptStatus } from 'types';
import useUiStore from 'stores/ui/uiStore';

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
  const [midentState, setMident] = useState('');
  const { settings } = window;
  const isCadenasLoaded = useUiStore(state => state.isCadenasLoaded);

  useEffect(() => {
    if (!isCadenasLoaded && !psol) {
      setStatus3dView('loading');
    }
    if (!isCadenasLoaded && !psol) {
      return;
    }
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

    psol.core.setUserInfo({
      server_type: 'oem_apps_cadenas_webcomponentsdemo',
      title: 'Herr',
      firstname: 'Max',
      lastname: 'Mustermann',
      userfirm: 'CADENAS GmbH',
      street: 'Berliner Allee 28 b+c',
      zip: '86153',
      city: 'Augsburg',
      country: 'de',
      phone: '+49 (0) 821 2 58 58 0-0',
      fax: '+49 (0) 821 2 58 58 0-999',
      email: 'info@cadenas.de',
    });
    psol.core.setServiceBaseUrl('https://webapi.partcommunity.com');

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
  }, [sku, setStatus3dView, settings, isCadenasLoaded]);

  const showWebViewer = !is3dView || status3dView !== 'loaded';

  return (
    <>
      {status3dView !== 'not-found' && (
        <div
          id="cnsWebViewer3d"
          style={{
            width: '100%',
            opacity: showWebViewer ? 0 : 1,
            transition:
              is3dView && status3dView !== 'loaded' ? 'opacity 2s ease' : '',
          }}
          className={twMerge([
            !showWebViewer && 'h-[368px]',
            !showWebViewer && 'desktop:h-[456px]',
            showWebViewer && 'h-0',
          ])}
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
                mident: midentState,
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
            width: '100%',
            color: '#AAABB5',
            background: 'linear-gradient(180deg, #fff 0%, #E9E9EC 100%)',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className={twMerge(['h-[368px]', 'desktop:h-[456px]'])}
        >
          No 3D View available for this item
        </div>
      )}
    </>
  );
}

export default CadenasWebViewer;
