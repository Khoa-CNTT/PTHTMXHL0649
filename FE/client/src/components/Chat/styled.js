import { Box, List, ListItem, Modal } from "@mui/material";
import { styled } from "@mui/system";


export const StyledModal = styled(Modal)(({ theme }) => ({
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "16px",
}));

export const ModalContainer = styled(Box)(({ theme }) => ({
    width: "360px",
    height: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    animation: "slideUp 0.3s ease-out",
    "@keyframes slideUp": {
        from: { transform: "translateY(100%)" },
        to: { transform: "translateY(0)" },
    },
    "@media (max-width: 600px)": {
        width: "100%",
        height: "80vh",
    },
}));

export const Header = styled(Box)(({ theme }) => ({
    padding: "16px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgb(4,68,164)",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    justifyContent: "space-between",
}));

export const SearchBox = styled(Box)(({ theme }) => ({
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    margin: "12px 16px",
}));

export const ConversationList = styled(List)(({ theme }) => ({
    flex: 1,
    overflow: "auto",
    padding: 0,
}));

export const ConversationItem = styled(ListItem)(({ theme }) => ({
    padding: "12px 16px",
    cursor: "pointer",
    "&:hover": {
        backgroundColor: "#f5f5f5",
    },
}));