import React from "react";
import { NavLink } from "react-router-dom";
// import * as H from "history";

function Navigation(): JSX.Element {
  // const handleCheckMatchLink = (match: any, location: H.Location) => {
  //   if (match?.url === location?.pathname) {
  //     return true;
  //   }
  //   return false;
  // };

  return (
    <ul className="d-flex align-center">
      <li>
        <NavLink
          activeClassName="active"
          // isActive={(match, location: H.Location) => {
          //   return handleCheckMatchLink(match, location);
          // }}
          isActive={() => false}
          to={"/search-history"}
          className="nav-link p-0 menu-children rounded-0"
        >
          <span className="d-none d-sm-block ms-4 px-2 py-1 border-bottom-1">
            Search history
          </span>
        </NavLink>
      </li>
    </ul>
  );
}

export default Navigation;
