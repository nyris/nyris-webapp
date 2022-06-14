import type { CurrentRefinement } from "./current-refinements";

function getRefinementConfig(r: any, refinement: any) {
  const refinementOptions = r.attribute;
  
  return refinementOptions?.attributes
    ? refinementOptions?.attributes[0] === refinement.attribute
    : refinementOptions === refinement.attribute;
}

export function getCurrentRefinement(
  refinement: any,
  config: any
): CurrentRefinement[] {
  let refinementConfig: any;
  config.refinements.forEach((r: any) => {
    const widgets = r?.widgets;
    const widgetCfg = widgets?.find((w: any) =>
      getRefinementConfig(w, refinement)
    );
    if (widgets?.length && widgetCfg) {
      refinementConfig = {
        ...r,
        ...widgetCfg,
      };
    } else if (getRefinementConfig(r, refinement)) {
      refinementConfig = r;
    }
  });

  switch (refinementConfig?.type) {
    case "size":
    case "list": {
      return (
        refinement?.items?.map((item: any) => ({
          category: refinementConfig?.label,
          label: item.label,
          value: item.value,
        })) || []
      );
    }
    default: {
      return [];
    }
  }
}
