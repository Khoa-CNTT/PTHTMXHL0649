// Modified Apps.jsx component

import React, { useState, useEffect, useRef } from "react";
import { MdApps } from "react-icons/md";
import { CustomizeMenu, Logout } from "..";
import { Divider, MenuItem, useColorScheme } from "@mui/material";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setTheme } from "~/redux/Slices/themeSlice";
import { FiBookmark } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { LuSettings } from "react-icons/lu";
import { IoLogOutOutline } from "react-icons/io5";

const Apps = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);
  const menuRef = useRef(null);

  // Add state for detecting screen size
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine icon size based on screen width
  const getIconSize = () => {
    if (windowWidth < 640) {
      // Mobile
      return 24;
    } else if (windowWidth < 1024) {
      // Tablet
      return 26;
    } else {
      // Desktop
      return 28;
    }
  };

  // Determine menu width based on screen size
  const getMenuWidth = () => {
    if (windowWidth < 640) {
      return "180px"; // Smaller width on mobile
    } else {
      return "240px"; // Default width
    }
  };

  const StyledDivider = styled(Divider)(({ theme }) => ({
    width: getMenuWidth(),
    borderColor: theme.colorSchemes.light.border,
    margin: `${theme.spacing(0.5)} 0`,

    ...theme.applyStyles("dark", {
      borderColor: theme.colorSchemes.dark.border,
    }),
  }));

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation(); // Prevent event bubbling to parent elements
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isChecked, setIsChecked] = useState(false);
  const { mode, setMode } = useColorScheme();

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsChecked((prevState) => !prevState);
    const themeValue = isChecked ? "light" : "dark";
    dispatch(setTheme(themeValue));
    setMode(themeValue);
  };

  // Apply responsive classes
  const iconContainerClasses = `flex justify-center p-1 items-center rounded-full transition-transform ${
    windowWidth < 640 ? "p-0.5" : "p-1"
  }`;

  const menuItemClasses = `flex items-center justify-between w-full ${
    windowWidth < 640 ? "text-sm py-1" : ""
  }`;

  // Handle menu item clicks with stopPropagation
  const handleMenuItemClick = (e, path) => {
    e.stopPropagation(); // Prevent event from bubbling up
    handleClose();
    navigate(path);
  };

  return (
    <div
      className={iconContainerClasses}
      ref={menuRef}
      data-menu-toggle // Mark this component to be excluded from the outside click handler
    >
      <MdApps
        size={getIconSize()}
        className={`cursor-pointer hover:scale-105 active:scale-90 ${
          open && "text-neutral-400"
        }`}
        onClick={handleClick}
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        data-menu-toggle // Mark this element to be excluded from the outside click handler
      />

      <CustomizeMenu
        anchor={{ vertical: "top", horizontal: "right" }}
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        styles={{
          marginTop: "8px",
          width: getMenuWidth(),
          maxHeight: windowWidth < 640 ? "80vh" : "auto",
        }}
        data-menu-toggle // Mark this component to be excluded from the outside click handler
      >
        {user?.token && (
          <div onClick={(e) => e.stopPropagation()}>
            <MenuItem
              onClick={(e) => handleMenuItemClick(e, "/settings")}
              dense={windowWidth < 640}
            >
              <div className={menuItemClasses}>
                <span
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {t("Cài đặt")}
                </span>
                <LuSettings
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                  size={windowWidth < 640 ? 18 : 20}
                />
              </div>
            </MenuItem>
            <MenuItem
              onClick={(e) => handleMenuItemClick(e, "/saveds")}
              dense={windowWidth < 640}
            >
              <div className={menuItemClasses}>
                <span
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {t("Đã lưu")}
                </span>
                <FiBookmark
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                  size={windowWidth < 640 ? 18 : 20}
                />
              </div>
            </MenuItem>
          </div>
        )}
        <MenuItem
          dense={windowWidth < 640}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={menuItemClasses}>
            <span
              className={`${theme === "dark" ? "text-white" : "text-black"}`}
            >
              {t("Chế độ tối")}
            </span>
            <label
              className="relative inline-flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={theme === "dark" ? true : false}
                onChange={(e) => handleToggle(e)}
                className="sr-only peer"
              />
              <div
                className={`${
                  windowWidth < 640 ? "w-8 h-4" : "w-9 h-5"
                } bg-gray-200 hover:bg-gray-300 peer-focus:outline-0 peer-focus:ring-transparent rounded-full peer transition-all ease-in-out duration-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bluePrimary hover:peer-checked:bg-bluePrimary`}
                onClick={(e) => e.stopPropagation()}
              ></div>
            </label>
          </div>
        </MenuItem>

        {user?.token && (
          <div onClick={(e) => e.stopPropagation()}>
            <StyledDivider />
            <Logout second />
          </div>
        )}
      </CustomizeMenu>
    </div>
  );
};

export default Apps;
