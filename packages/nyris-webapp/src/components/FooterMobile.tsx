import { Box, Button } from "@material-ui/core";
import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import IconSupportMobile from "common/assets/icons/support_mobile.svg";
import IconAdminMobile from "common/assets/icons/admin_mobile.svg";
import IconCameraMobile from "common/assets/icons/icon_camera_mobile.svg";
import CameraCustom from "./drawer/cameraCustom";

interface Props {
  onLoadingMobile?: any;
}

function FooterMobile(props: Props): JSX.Element {
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const history = useHistory();
  const handleCheckMatchLink = (match: any, location: any) => {
    let active = false;
    if (match?.url === location.pathname) {
      active = true;
    }

    return active;
  };

  return (
    <Box
      className="box-footer-mobile"
      display={"flex"}
      position={"relative"}
      alignItems={"center"}
      height={"100%"}
      justifyContent={"flex-end"}
    >
      <Box className="box-icon-camera-mobile">
        <Button
          onClick={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        >
          <img
            width={28}
            height={28}
            src={`${IconCameraMobile}`}
            alt="open_camera_mobile"
          />
        </Button>
      </Box>
     {/* hidden_as_required {history.location.pathname !== "/" && (
        <>
          <Box style={{ padding: 23 }}>
            <NavLink
              activeClassName="active"
              isActive={(match, location) =>
                handleCheckMatchLink(match, location)
              }
              to={"/support"}
              className="nav-link p-0 menu-children rounded-0"
            >
              <img
                width={24}
                height={24}
                src={`${IconSupportMobile}`}
                alt="support_mobile"
              />
            </NavLink>
          </Box>

          <Box style={{ padding: 23 }}>
            <NavLink
              activeClassName="active"
              isActive={(match, location) =>
                handleCheckMatchLink(match, location)
              }
              to={"/account"}
              className="nav-link p-0 menu-children rounded-0"
            >
              <img
                width={24}
                height={24}
                src={`${IconAdminMobile}`}
                alt="account_page"
              />
            </NavLink>
          </Box>
        </>
      )}*/}

      <Box className="box-screenshot-camera">
        <CameraCustom
          isToggle={isOpenModalCamera}
          onToggleModal={() => {
            setOpenModalCamera(!isOpenModalCamera);
          }}
        />
      </Box>
    </Box>
  );
}

export default FooterMobile;
