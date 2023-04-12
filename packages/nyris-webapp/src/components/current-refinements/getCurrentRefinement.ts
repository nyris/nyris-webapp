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
  config.forEach((r: any) => {
    if (getRefinementConfig(r, refinement)) {
      refinementConfig = r;
    }
  });
  
  switch (refinementConfig?.type) {
    case "size":
    case "list": {
      return (
        refinement?.items?.map((item: any) => ({
          category: refinementConfig?.header,
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
