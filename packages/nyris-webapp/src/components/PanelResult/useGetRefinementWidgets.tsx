import { useMemo } from "react";
import { getPanelId } from "./refinements";
import React from "react";
import { RefinementList } from "react-instantsearch-dom";
export function useGetRefinementWidgets(refinements: any[]) {
  return useMemo(
    () =>
      refinements.map((refinement) => {
        const panelId = getPanelId(refinement);

        let refinementWidgets: any;
        if (refinement.widgets?.length) {
          refinementWidgets = (
            <div className="flex flex-col gap-2">
              {refinement.widgets.map((refinementWidget: any) => {
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
          refinementWidgets = (
            <RefinementList
              className="box-refinement-list"
              type={refinement.type}
              attribute={refinement.attribute}
              {...refinement.options}
              translations={{
                noResults: "No results",
                placeholder: "",
              }}
            />
          );
        }

        return refinementWidgets;
      }),
    [refinements]
  );
}
