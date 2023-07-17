import React, { memo } from 'react';
import ExpandablePanelComponent from 'components/PanelResult';

import { connectStateResults } from 'react-instantsearch-dom';

interface Props {
  allSearchResults: any;
  onApply: any;
}

function MobilePostFilter(props: Props) {
  return (
    <ExpandablePanelComponent
      disjunctiveFacets={props?.allSearchResults?.disjunctiveFacets}
      onApply={props.onApply}
    />
  );
}

export default connectStateResults<Props>(memo(MobilePostFilter));
