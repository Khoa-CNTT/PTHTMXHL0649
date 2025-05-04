import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "~/redux/Slices/languageSlice";
import i18n from "~/utils/i18n/i18n";
import { _langs } from "~/constants";
import { useTranslation } from "react-i18next";

const ChangeLanguage = ({ data = _langs, sx, ...other }) => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const [openPopover, setOpenPopover] = useState(null);
  const { t } = useTranslation();

  const handleOpenPopover = useCallback((event) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeLang = useCallback(
    (newLang) => {
      dispatch(setLanguage(newLang));
      i18n.changeLanguage(newLang);
      handleClosePopover();
    },
    [dispatch, handleClosePopover]
  );

  const currentLang = data.find((lang) => lang.value === language);

  const renderFlag = (label, icon) => (
    <Box
      component="img"
      alt={label}
      src={icon}
      sx={{ width: 26, height: 20, borderRadius: 0.5, objectFit: "cover" }}
    />
  );

  return (
    <div>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          width: 40,
          height: 40,
          ...(openPopover && { bgcolor: "action.selected" }),
          ...sx,
        }}
        {...other}
      >
        {renderFlag(currentLang?.label, currentLang?.icon)}
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 160,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === language}
              onClick={() => handleChangeLang(option.value)}
              sx={{
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  fontWeight: "bold",
                },
              }}
            >
              {renderFlag(option.label, option.icon)}
              {t(option.label)}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </div>
  );
};

export default ChangeLanguage;
