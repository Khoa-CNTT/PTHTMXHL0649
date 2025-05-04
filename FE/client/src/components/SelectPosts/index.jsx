import React, { useState, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { CustomizeMenu } from "..";
import { Divider, MenuItem } from "@mui/material";
import { FaCheck } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import styled from "@emotion/styled";
import { setSentiment } from "~/redux/Slices/postSlice";
import { selectsPost } from "~/constants";
import { useTranslation } from "react-i18next";

const SelectPosts = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const sentiment = useSelector((state) => state.post.sentiment);
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const StyledDivider = styled(Divider)(({ theme }) => ({
    width: isMobile ? "180px" : "220px",
    borderColor: theme.colorSchemes.light.border,
    margin: `${theme.spacing(0.5)} 0`,

    ...theme.applyStyles("dark", {
      borderColor: theme.colorSchemes.dark.border,
    }),
  }));

  const handleMenuItemClick = (e, i) => {
    dispatch(setSentiment(selectsPost[i]));
    setAnchorEl(null);
  };

  // Dynamic styles based on device
  const buttonClasses = `${
    isMobile ? "w-5 h-5" : "w-6 h-6"
  } rounded-full bg-primary flex shadow-sm items-center justify-center hover:scale-110 active:scale-90 cursor-pointer transition-transform border-1 border-borderNewFeed`;

  const iconSize = isMobile ? 12 : 14;

  return (
    <div>
      <div
        onClick={handleClick}
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        className={buttonClasses}
      >
        <RiArrowDownSLine size={iconSize} className="text-bgStandard" />
      </div>
      <CustomizeMenu
        anchor={{
          vertical: "top",
          horizontal: isMobile ? "right" : "center",
        }}
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        styles={{
          marginTop: "8px",
          width: isMobile ? "180px" : "250px",
        }}
      >
        {selectsPost.map((option, i) => (
          <div key={i}>
            <MenuItem
              onClick={(e) => handleMenuItemClick(e, i)}
              selected={selectsPost[i] === sentiment}
              style={{ padding: isMobile ? "6px 12px" : "8px 16px" }}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  } ${isMobile ? "text-xs" : "text-sm"} font-medium`}
                >
                  {t(option)}
                </span>
                {selectsPost[i] === sentiment && (
                  <FaCheck
                    className={`${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                    size={isMobile ? 12 : 14}
                  />
                )}
              </div>
            </MenuItem>
            {i === 0 && <StyledDivider />}
          </div>
        ))}
      </CustomizeMenu>
    </div>
  );
};

export default SelectPosts;
