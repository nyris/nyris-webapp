import React, { memo } from 'react';

import PostFilterPanel from './PanelResult/PostFilter';
import PostFilterPanelAlgolia from './PanelResult/PostFilterAlgolia';

import { connectStateResults } from 'react-instantsearch-dom';
import { useAppSelector } from 'Store/Store';

interface Props {
  allSearchResults: any;
  onApply: any;
}

function MobilePostFilter(props: Props) {
  const settings = useAppSelector(state => state.settings);
  return (
    <>
      {settings.algolia.enabled && (
        <PostFilterPanelAlgolia
          disjunctiveFacets={props?.allSearchResults?.disjunctiveFacets}
          onApply={props.onApply}
        />
      )}
      {!settings.algolia.enabled && <PostFilterPanel onApply={props.onApply} />}
    </>
  );
}

export default connectStateResults<Props>(memo(MobilePostFilter));
