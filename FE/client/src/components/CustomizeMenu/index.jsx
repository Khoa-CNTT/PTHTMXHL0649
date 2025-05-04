import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Menu from "@mui/material/Menu";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    className="customized-menu"
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 15,
    padding: "5px",
    minWidth: 180,
    borderWidth: "0.8px",
    color: "#fff",
    borderColor: theme.colorSchemes.light.border,
    backgroundColor: theme.colorSchemes.light.primary.main,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.colorSchemes.dark.primary.main,
      borderColor: theme.colorSchemes.dark.border,
    }),
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      borderRadius: 10,
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.dark,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.bgDark,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const CustomizeMenu = ({
  open,
  handleClose,
  anchorEl,
  children,
  anchor,
  styles,
}) => {
  return (
    <div>
      <StyledMenu
        sx={styles}
        aria-hidden={!open}
        transformOrigin={anchor}
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {children}
      </StyledMenu>
    </div>
  );
};

export default CustomizeMenu;
