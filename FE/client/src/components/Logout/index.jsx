import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "..";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { resetUser } from "~/redux/Slices/userSlice";
import { MenuItem } from "@mui/material";
import * as UserService from "~/services/UserService";
import { IoLogOutOutline } from "react-icons/io5";
import ConfirmDialog from "~/components/ConfirmDialog";

const Logout = ({ second, primary }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleClose = () => setOpen(false);

  // Detect if device is mobile
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

  const handleLogout = async () => {
    setLoading(true);
    const res = await UserService.logout(user?.token);
    if (res?.code === 1000) {
      setLoading(false);
      dispatch(resetUser());
      navigate("/login");
    }
  };

  // Only apply mobile-specific styles if on mobile
  const dialogClassName = isMobile ? "w-[280px]" : "w-[320px]";

  return (
    <div>
      {second && (
        <div>
          <MenuItem onClick={() => setOpen(true)}>
            <div className="flex items-center justify-between w-full">
              <span className="text-red-600">{t("Đăng xuất")}</span>
              <IoLogOutOutline color="red" size={isMobile ? 18 : 20} />
            </div>
          </MenuItem>
          <ConfirmDialog
            open={open}
            onClose={handleClose}
            onConfirm={handleLogout}
            loading={loading}
            title={t("Bạn có chắc không")}
            description={t(
              "Bạn có chắc chắn muốn đăng xuất? Mọi tiến trình chưa lưu sẽ bị mất"
            )}
            confirmText={t("Đăng xuất")}
            variant="danger"
            className={dialogClassName}
          />
        </div>
      )}
      {primary && (
        <div>
          {user?.token ? (
            <div>
              <div className="relative">
                <Button
                  onClick={() => setOpen(true)}
                  title={t("Đăng xuất")}
                  className={`text-${
                    isMobile ? "xs" : "sm"
                  } text-ascent-1 hover:scale-105 transition-transform active:scale-90 px-${
                    isMobile ? "3" : "4"
                  } md:px-6 py-1 md:py-2 border-x-[0.8px] border-y-[0.8px] border-solid shadow-newFeed rounded-full border-borderNewFeed`}
                />
              </div>
              <ConfirmDialog
                open={open}
                onClose={handleClose}
                onConfirm={handleLogout}
                loading={loading}
                title={t("Bạn có chắc không")}
                description={t(
                  "Bạn có chắc chắn muốn đăng xuất? Mọi tiến trình chưa lưu sẽ bị mất"
                )}
                confirmText={t("Đăng xuất")}
                variant="danger"
                className={dialogClassName}
              />
            </div>
          ) : (
            <div className="relative inline-flex group">
              <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
              <span
                onClick={() => navigate("/login")}
                className={`relative inline-flex items-center justify-center px-${
                  isMobile ? "3" : "4"
                } md:px-6 py-1 md:py-2 text-${
                  isMobile ? "xs" : "sm"
                } text-white transition-all duration-200 bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
                role="button"
              >
                {t("Đăng nhập")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logout;
