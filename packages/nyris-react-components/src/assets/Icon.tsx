import React from 'react';
import type { FC, SVGAttributes } from 'react';

import { ReactComponent as SearchImage } from './icons/icon_search_image.svg';
import { ReactComponent as Share } from './icons/share.svg';
import { ReactComponent as DisLike } from './icons/icon_dislike.svg';
import { ReactComponent as Like } from './icons/icon_like.svg';
import { ReactComponent as Link } from './icons/link.svg';
import { ReactComponent as Download } from './icons/download.svg';
import { ReactComponent as Drop } from './icons/drop.svg';
import { ReactComponent as Close } from './icons/close.svg';
import { ReactComponent as Back } from './icons/back.svg';
import { ReactComponent as Avatar } from './icons/avatar.svg';
import { ReactComponent as Filter } from './icons/filter.svg';
import { ReactComponent as Logout } from './icons/logout.svg';
import { ReactComponent as CameraSimple } from './icons/camera_simple.svg';
import { ReactComponent as FilterSettings } from './icons/filter_settings.svg';
import { ReactComponent as Plus } from './icons/plus.svg';
import { ReactComponent as Crop } from './icons/crop.svg';
import { ReactComponent as Collapse } from './icons/collapse.svg';
import { ReactComponent as Trash } from './icons/trash.svg';
import { ReactComponent as Info } from './icons/info-tooltip.svg';
import { ReactComponent as Box3d } from './icons/3d.svg';
import { ReactComponent as Settings } from './icons/settings.svg';
import { ReactComponent as Gallery } from './icons/gallery.svg';
import { ReactComponent as NextArrow } from './icons/next-arrow.svg';
import { ReactComponent as Minus } from './icons/minus.svg';
import { ReactComponent as PlusRounded } from './icons/plus-rounded.svg';
import { ReactComponent as Search } from './icons/icon_search.svg';
import { ReactComponent as Email } from './icons/icon_email.svg';
import { ReactComponent as Call } from './icons/call.svg';
import { ReactComponent as Error } from './icons/error.svg';
import { ReactComponent as Camera } from './icons/camera.svg';
import { ReactComponent as PoweredByNyris } from './icons/powered_by_nyris_colored.svg';
import { ReactComponent as CaretLeft } from './icons/caret-left.svg';
import { ReactComponent as CaretRight } from './icons/caret-right.svg';
import { ReactComponent as ExperienceVisualSearch } from './icons/experience_visual_search.svg';
import { ReactComponent as ArrowDown } from './icons/arrow_down.svg';
import { ReactComponent as MachineView } from './icons/machine_view.svg';
import { ReactComponent as AutoFocus } from './icons/auto_focus.svg';
import { ReactComponent as Wear } from './icons/wear.svg';
import { ReactComponent as Spare } from './icons/spare.svg';
import { ReactComponent as Copy } from './icons/copy.svg';

import { SUPPORTED_ICON } from './types';

type IconConfig = { component: FC<SVGAttributes<SVGElement>> };

export const svgIconsConfig: Record<SUPPORTED_ICON, IconConfig> = {
  arrow_down: { component: ArrowDown },
  auto_focus: { component: AutoFocus },
  avatar: { component: Avatar },
  back: { component: Back },
  box3d: { component: Box3d },
  call: { component: Call },
  camera_simple: { component: CameraSimple },
  camera: { component: Camera },
  caret_left: { component: CaretLeft },
  caret_right: { component: CaretRight },
  close: { component: Close },
  collapse: { component: Collapse },
  copy: { component: Copy },
  crop: { component: Crop },
  dislike: { component: DisLike },
  download: { component: Download },
  drop: { component: Drop },
  email: { component: Email },
  error: { component: Error },
  experience_visual_search: { component: ExperienceVisualSearch },
  filter_settings: { component: FilterSettings },
  filter: { component: Filter },
  gallery: { component: Gallery },
  info: { component: Info },
  like: { component: Like },
  link: { component: Link },
  logout: { component: Logout },
  machine_view: { component: MachineView },
  minus: { component: Minus },
  next_arrow: { component: NextArrow },
  plus_rounded: { component: PlusRounded },
  plus: { component: Plus },
  powered_by_nyris: { component: PoweredByNyris },
  search_image: { component: SearchImage },
  search: { component: Search },
  settings: { component: Settings },
  share: { component: Share },
  spare: { component: Spare },
  trash: { component: Trash },
  wear: { component: Wear },
};
const Icon: FC<
  {
    name: SUPPORTED_ICON;
  } & SVGAttributes<SVGElement>
> = ({ name, ...props }) => {
  const IconComponent = svgIconsConfig[name]?.component;

  return IconComponent ? (
    <IconComponent width={16} height={16} {...props} />
  ) : null;
};

export default Icon;
