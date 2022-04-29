import React from "react";
import { Hit as AlgoliaHit } from "@algolia/client-search";
import { useHits, UseHitsProps } from "react-instantsearch-hooks";
import { useAppDispatch } from "Store/Store";
import { useEffect } from "react";
import { resultSearchText } from "Store/Search";
import { useState } from "react";
import { CircularProgress } from "@material-ui/core";

export type HitsProps<THit> = React.ComponentProps<"div"> &
  UseHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element;
  };

export function Hits<THit extends AlgoliaHit<Record<string, unknown>>>({
  hitComponent: Hit,
  ...props
}: HitsProps<THit>) {
  
  const { hits } = useHits(props);
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (hits?.length > 0) {
      dispatch(resultSearchText(hits));
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {hits.map((hit: any, index: any) => (
            <Hit key={index} hit={hit as unknown as THit} />
          ))}
        </>
      )}
    </>
  );
}
