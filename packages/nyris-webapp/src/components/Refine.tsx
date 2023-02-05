import { useQuery } from 'hooks/useQuery';
import { isEmpty } from 'lodash';
import React, { memo, useEffect } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useAppDispatch, useAppSelector } from 'Store/Store';

const RefineComponent = (props: any) => {
  const { refine } = props;
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const { textSearchInputMobile } = search;
  const dispatch = useAppDispatch();
  const query = useQuery();

  useEffect(() => {
    const searchQuery = query.get('query') || '';
    refine(searchQuery);
    // not an ideal solution: fixes text search not working from landing page
    setTimeout(() => {
      refine(searchQuery);
    }, 100);
  }, [query, dispatch]);

  useEffect(() => {
    console.log({ textSearchInputMobile });
    return () => {};
  }, [textSearchInputMobile]);

  return <></>;
};

const Refine = connectSearchBox<any>(memo(RefineComponent));
export default Refine;
