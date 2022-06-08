import React, { useEffect, useState } from "react";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";

export type LabelPosition = "bottom" | "left" | "right" | "top";

export type IconLabelProps = {
  icon?: any;
  label?: string;
  labelPosition?: LabelPosition;
  className?: string;
  classNameLabel?: string;
};

export default function IconLabel({
  icon,
  label,
  labelPosition = "bottom",
  className = "gap-1",
  classNameLabel = "",
}: IconLabelProps) {
  const [tagIcon, setTagIcon] = useState<string>("");
  // let classNamePosition: string;
  // switch (labelPosition) {
  //   case "top":
  //     classNamePosition = "flex-col-reverse";
  //     break;
  //   case "left":
  //     classNamePosition = "flex-row-reverse";
  //     break;
  //   case "right":
  //     classNamePosition = "flex-row";
  //     break;
  //   case "bottom":
  //   default:
  //     classNamePosition = "flex-col";
  //     break;
  // }
  useEffect(() => {
    setTagIcon(icon);
  }, [icon]);

  return (
    <div style={{ display: "flex" }}>
      {(tagIcon === "remove" ? <RemoveIcon /> : <AddIcon />)}
      {label && <div className={classNameLabel}>{label}</div>}
    </div>
  );
}
