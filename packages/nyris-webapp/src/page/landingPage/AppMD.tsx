import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import './common.scss';
import { cadExtensions } from '@nyris/nyris-api';
import algoliasearch from 'algoliasearch/lite';
import IconSupport from 'common/assets/icons/support3.svg';
import DragDropFile from 'components/DragDropFile';
import CustomSearchBox from 'components/input/inputSearch';
import { connectInfiniteHits } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { useAppSelector } from 'Store/Store';
import { AlgoliaSettings } from '../../types';

function AppMD() {
  const { settings } = useAppSelector(state => state);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const searchClient = algoliasearch(appId, apiKey);
  searchClient.initIndex(indexName);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  const acceptTypes = ['image/*']
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(',');

  const InfiniteHits = ({ hits }: any) => {
    return <div></div>;
  };

  const onChangeLoading = (value: boolean) => {
    setLoading(value);
  };

  const CustomInfiniteHits = connectInfiniteHits(InfiniteHits);

  return (
    <Box className={`box-content-main ${isLoading ? 'loading' : ''}`}>
      <Box className="box-content_top">
        <Box className="fw-700 text-f32 text-dark2">
          <h1>{settings.headerText}</h1>
        </Box>
        <div className="box-input">
          <div className="wrap-input-search">
            <div style={{ display: 'none' }}>
              <CustomInfiniteHits />
            </div>
            <CustomSearchBox />
          </div>
        </div>
      </Box>
      <Box className="box-content_bottom">
        <DragDropFile
          acceptTypes={acceptTypes}
          isLoading={isLoading}
          onChangeLoading={onChangeLoading}
        />
      </Box>
    </Box>
  );
}

export default AppMD;
