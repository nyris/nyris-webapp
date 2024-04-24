import type { Refinement, RefinementWidget } from "./refinements-type";

export function getRefinementPanelId(
  refinement: Refinement | RefinementWidget
) {
  return refinement?.attributes
    ? refinement.options?.attributes.join(":")
    : refinement?.attribute;
}

export function getPanelId(refinement: Refinement | RefinementWidget) {
  const widgets = (refinement as Refinement).widgets;

  const panelId = [];
  if (widgets?.length) {
    widgets.forEach((refinementWidget: RefinementWidget) =>
      panelId.push(getRefinementPanelId(refinementWidget))
    );
  } else {
    panelId.push(getRefinementPanelId(refinement));
  }

  return panelId.join(":");
}

export function getRefinementPanelAttribute(
  refinement: Refinement | RefinementWidget
) {
  return refinement?.attribute;
}

export function getPanelAttributes(refinement: Refinement | RefinementWidget) {
  const widgets = (refinement as Refinement)?.widgets;

  const panelAttributes = [];
  if (widgets?.length) {
    widgets.forEach((refinementWidget: RefinementWidget) =>
      panelAttributes.push(getRefinementPanelAttribute(refinementWidget))
    );
  } else {
    panelAttributes.push(getRefinementPanelAttribute(refinement));
  }
  return panelAttributes;
}
