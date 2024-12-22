import { Pagination } from 'components/Pagination';
import ProductList from 'components/Product/ProductList';
import SidePanel from 'components/SidePanel';
import React, { useEffect, useState } from 'react';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import { twMerge } from 'tailwind-merge';
import { CadenasScriptStatus } from 'types';

import { addAssets } from 'utils/addAssets';

const assets_base_url =
  'https://assets.nyris.io/nyris-widget/cadenas/8.1.0/api';

function Results() {
  const cadenas = window.settings.cadenas;

  const [cadenasScriptStatus, setCadenasScriptStatus] =
    useState<CadenasScriptStatus>('disabled');

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );

  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);

  useEffect(() => {
    if (cadenas?.cadenasAPIKey) {
      setCadenasScriptStatus('loading');
      addAssets([`${assets_base_url}/css/psol.components.min.css`]).catch(
        (error: any) => {
          setCadenasScriptStatus('failed');
        },
      );

      addAssets([`${assets_base_url}/js/thirdparty.min.js`])
        .then(() => {
          addAssets([`${assets_base_url}/js/psol.components.min.js`])
            .then(() => {
              setCadenasScriptStatus('ready');
            })
            .catch((error: any) => {
              setCadenasScriptStatus('failed');
            });
        })
        .catch((error: any) => {
          setCadenasScriptStatus('failed');
        });
    }
  }, [cadenas?.cadenasAPIKey]);

  return (
    <div className="h-full">
      <div
        className={twMerge(['flex', 'justify-between', 'relative', 'h-full'])}
      >
        <SidePanel />
        <div
          className={twMerge([
            'pt-10',
            'overflow-hidden',
            'overflow-y-auto',
            'flex',
            'flex-col',
            'relative',
            'w-full',
            'mr-auto',
            'ml-auto',
          ])}
        >
          <div
            className={twMerge([
              'flex',
              'flex-col',
              'flex-grow',
              'mt-4',
              'desktop:mt-0',
            ])}
          >
            <div
              className={twMerge([
                'h-full',
                'relative',
                'flex',
                'justify-center',
                'mx-4',
              ])}
            >
              <div className="max-w-[840px] w-full">
                <ProductList />
              </div>
            </div>
          </div>
          <Pagination />
        </div>
      </div>
    </div>
  );
}

export default Results;
