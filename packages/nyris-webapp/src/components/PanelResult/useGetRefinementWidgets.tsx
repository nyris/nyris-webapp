import { useMemo } from "react";
import { getPanelId } from "./refinements";
import React from "react";
import { RefinementList } from "react-instantsearch-dom";

export function useGetRefinementWidgets(refinements: any[]) {
  // console.log('refinements', refinements);

  return useMemo(
    () =>
      refinements.map((refinement) => {
        const panelId = getPanelId(refinement);

        let refinementWidgets: any;
        if (refinement.widgets?.length) {
          refinementWidgets = (
            <div className="flex flex-col gap-2">
              {refinement.widgets.map((refinementWidget: any) => {
                console.log("refinementWidget", refinementWidget);

                return (
                  <RefinementList
                    key={`${panelId}:${refinementWidget.type}`}
                    type={refinementWidget.type}
                    {...refinementWidget.options}
                  />
                );
              })}
            </div>
          );
        } else {
          console.log("refinement", { ...refinement.options });

          refinementWidgets = (
            <RefinementList
              type={refinement.type}
              attribute={refinement.attribute}
            />
          );
        }

        return refinementWidgets;
      }),
    [refinements]
  );
}
