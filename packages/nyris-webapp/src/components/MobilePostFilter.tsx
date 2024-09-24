import React, { memo } from 'react';

import PostFilterPanel from './PanelResult/PostFilter';
import PostFilterPanelAlgolia from './PanelResult/PostFilterAlgolia';

import { connectStateResults } from 'react-instantsearch-dom';
import { useAppSelector } from 'Store/Store';

interface Props {
  allSearchResults: any;
  onApply: any;
  isOpenFilter: boolean;
}

function MobilePostFilter(props: Props) {
  const settings = useAppSelector(state => state.settings);
  const { isOpenFilter, allSearchResults, onApply } = props;

  return (
    <>
      {settings.algolia.enabled && (
        <PostFilterPanelAlgolia
          disjunctiveFacets={allSearchResults?.disjunctiveFacets}
          onApply={onApply}
        />
      )}

      {!settings.algolia.enabled && isOpenFilter && (
        <PostFilterPanel onApply={onApply} />
      )}
    </>
  );
}

export default connectStateResults<Props>(memo(MobilePostFilter));
