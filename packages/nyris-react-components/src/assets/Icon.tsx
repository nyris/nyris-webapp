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

import { SUPPORTED_ICON } from './types';

type IconConfig = { component: FC<SVGAttributes<SVGElement>> };

export const svgIconsConfig: Record<SUPPORTED_ICON, IconConfig> = {
  dislike: { component: DisLike },
  like: { component: Like },
  search_image: { component: SearchImage },
  share: { component: Share },
  link: { component: Link },
  download: { component: Download },
  drop: { component: Drop },
  close: { component: Close },
  back: { component: Back },
  avatar: { component: Avatar },
  filter: { component: Filter },
  logout: { component: Logout },
  camera_simple: { component: CameraSimple },
  filter_settings: { component: FilterSettings },
  plus: { component: Plus },
  crop: { component: Crop },
  collapse: { component: Collapse },
  trash: { component: Trash },
  info: { component: Info },
  box3d: { component: Box3d },
  settings: { component: Settings },
  gallery: { component: Gallery },
  next_arrow: { component: NextArrow },
  minus: { component: Minus },
  plus_rounded: { component: PlusRounded },
  search: { component: Search },
  email: { component: Email },
  call: { component: Call },
  error: { component: Error },
  camera: { component: Camera },
  powered_by_nyris: { component: PoweredByNyris },
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
