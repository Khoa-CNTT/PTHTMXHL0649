import { Alert, Snackbar } from "@mui/material";
import React from "react";

const Alerts = ({
  message = "Something went wrong!",
  type = "success",
  icon,
  open,
  handleClose,
  position,
  duration,
}) => {
  return (
    <Snackbar
      anchorOrigin={position}
      open={open}
      autoHideDuration={Number(duration)}
      onClose={handleClose}
    >
      <Alert
        icon={icon}
        severity={type}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Alerts;
