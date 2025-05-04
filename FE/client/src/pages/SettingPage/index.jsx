import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BlockList,
  DeleteAccount,
  PageMeta,
  TopBar,
  VerifyEmail,
} from "~/components";
import { RiEyeOffLine } from "react-icons/ri";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import * as UserService from "~/services/UserService";
import { updateStatus } from "~/redux/Slices/userSlice";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "~/utils";
import ChangePassword from "~/components/ChangePassword";
import HistoryLogin from "~/components/HistoryLogin";
import ConfirmDialog from "~/components/ConfirmDialog";
import { GoLock } from "react-icons/go";

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: "screen" }}>{children}</Box>}
    </div>
  );
};

const SettingPage = () => {
  const theme = useSelector((state) => state?.theme?.theme);
  const [value, setValue] = useState(0);
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loadingChangeStatus, setLoadingChangeStatus] = useState(false);
  const [openConfirmChangeStatus, setOpenConfirmChangeStatus] = useState(false);
  const [openConfirmChangePrivacy, setOpenConfirmChangePrivacy] =
    useState(false);
  const handleCloseConfirmChangeStatus = () =>
    setOpenConfirmChangeStatus(false);
  const handleCloseConfirmChangePrivacy = () =>
    setOpenConfirmChangePrivacy(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  //change status
  const handleToggle = () => {
    setOpenConfirmChangeStatus(true);
  };

  const handleToggleChangePrivacy = () => {
    setOpenConfirmChangePrivacy(true);
  };

  const handleChangeStatus = async () => {
    setLoadingChangeStatus(true);
    try {
      const newStatus = user?.status === "ONLINE" ? "OFFLINE" : "ONLINE";
      const res = await UserService.updateStatus({ status: newStatus });
      if (res?.code === 1000) {
        dispatch(updateStatus(res?.result?.status));
      }
    } finally {
      setLoadingChangeStatus(false);
      setOpenConfirmChangeStatus(false);
    }
  };

  return (
    <div>
      <PageMeta title={t(`Cài đặt - ${APP_NAME}`)} />
      <ConfirmDialog
        open={openConfirmChangeStatus}
        onClose={handleCloseConfirmChangeStatus}
        onConfirm={handleChangeStatus}
        loading={loadingChangeStatus}
        title={t("Bạn có chắc không")}
        className="w-[300px]"
        description={t(
          "Bạn có chắc chắn muốn thay đổi trạng thái hoạt động không?"
        )}
        variant="danger"
      />

      <ConfirmDialog
        open={openConfirmChangePrivacy}
        onClose={handleCloseConfirmChangePrivacy}
        title={t("Xác nhận")}
        className="w-[300px]"
        description={t("Coming soon!")}
        variant="danger"
      />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t(`Cài đặt`)} iconBack />

        <div className="w-full h-full flex justify-center">
          <div className="w-[680px] flex flex-col h-full bg-primary p-5 rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Tabs
                  sx={{
                    color: theme === "dark" ? "#fff" : "#000",
                    "& .MuiTabs-indicator": {
                      backgroundColor: theme === "dark" ? "#fff" : "#000",
                      height: "1px",
                    },
                  }}
                  indicatorColor="primary"
                  textColor="inherit"
                  value={value}
                  onChange={handleChange}
                  variant="fullWidth"
                  aria-label="basic tabs example"
                >
                  <Tab label={t("Quyền riêng tư")} {...a11yProps(0)} />
                  <Tab label={t("Tài khoản")} {...a11yProps(1)} />
                  <Tab label={t("Trợ giúp")} {...a11yProps(2)} />
                </Tabs>
              </Box>
              {/* 1 */}
              <CustomTabPanel value={value} index={0}>
                <div className="w-full h-ful gap-y-3 py-5 flex-col flex justify-center items-center">
                  {/* 2 */}
                  <div className="w-full py-3 px-2 h-full flex justify-between items-center">
                    <div className="flex items-center gap-x-2">
                      <RiEyeOffLine size={20} className="text-bgStandard" />
                      <h1 className="text-ascent-1">
                        {t("Trạng thái hoạt động")}
                      </h1>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.status === "ONLINE" ? true : false}
                          onChange={handleToggle}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-0 peer-focus:ring-transparent rounded-full peer transition-all ease-in-out duration-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bluePrimary    hover:peer-checked:bg-bluePrimary"></div>
                      </label>
                    </div>
                  </div>
                  {/* 1 */}
                  <div className="w-full py-3 px-2 h-full flex justify-between items-center">
                    <div className="flex items-center gap-x-2">
                      <GoLock size={19} className="text-bgStandard" />
                      <h1 className="text-ascent-1">
                        {t("Trang cá nhân riêng tư")}
                      </h1>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.status === "ONLINE" ? true : false}
                          onChange={handleToggleChangePrivacy}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-0 peer-focus:ring-transparent rounded-full peer transition-all ease-in-out duration-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bluePrimary hover:peer-checked:bg-bluePrimary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </CustomTabPanel>
              {/* 2 */}
              <CustomTabPanel value={value} index={1}>
                <div className="w-full h-ful gap-y-3 py-5 flex-col flex justify-center items-center">
                  {/* 1 */}
                  <div className="w-full py-3  px-2 h-full flex justify-between items-center cursor-pointer">
                    <h1 className="text-ascent-1">
                      {t("Vô hiệu hóa hoặc xóa tài khoản")}
                    </h1>
                    <DeleteAccount setting />
                  </div>

                  {/* 2 */}
                  <div className="w-full py-3  px-2 h-full flex justify-between items-center cursor-pointer">
                    <h1 className="text-ascent-1">
                      {t("Xác thực email của bạn")}
                    </h1>
                    <VerifyEmail setting />
                  </div>

                  {/* 3 */}
                  <div className="w-full py-3 px-2 h-full flex justify-between items-center cursor-pointer">
                    <h1 className="text-ascent-1">{t("Đã chặn")}</h1>
                    <BlockList setting />
                  </div>

                  {/* 4 */}
                  <div className="w-full py-3 px-2 h-full flex justify-between items-center cursor-pointer">
                    <h1 className="text-ascent-1">{t("Thay đổi mật khẩu")}</h1>
                    <ChangePassword setting />
                  </div>
                  {/* 5 */}
                  <div className="w-full py-3 px-2 h-full flex justify-between items-center cursor-pointer">
                    <h1 className="text-ascent-1">{t("Lịch sử thiết bị")}</h1>
                    <HistoryLogin setting />
                  </div>
                </div>
              </CustomTabPanel>
              {/* 3 */}
              <CustomTabPanel value={value} index={2}>
                <div className="w-full h-ful gap-y-5 py-5 flex-col flex justify-center items-center">
                  {/* 1 */}
                  <a
                    href="https://vietnam.un.org/vi"
                    target="_blank"
                    className="w-full py-3 px-2 h-full flex justify-between items-center"
                  >
                    <h1 className="text-ascent-1">{t("Trung tâm trợ giúp")}</h1>
                    <FaArrowUpRightFromSquare
                      size={20}
                      className="text-bgStandard"
                    />
                  </a>

                  {/* 2 */}
                  <a
                    href="https://vietnam.un.org/vi"
                    target="_blank"
                    className="w-full py-3 px-2 h-full flex justify-between items-center"
                  >
                    <h1 className="text-ascent-1">
                      {t("Chính sách và quyền riêng tư của LinkVerse")}
                    </h1>
                    <FaArrowUpRightFromSquare
                      size={20}
                      className="text-bgStandard"
                    />
                  </a>
                  {/* 3 */}
                  <a
                    href="https://vietnam.un.org/vi"
                    target="_blank"
                    className="w-full py-3 px-2 h-full flex justify-between items-center"
                  >
                    <h1 className="text-ascent-1">
                      {t("Điều khoản dịch vụ của LinkVerse")}
                    </h1>
                    <FaArrowUpRightFromSquare
                      size={20}
                      className="text-bgStandard"
                    />
                  </a>
                  {/* 4 */}
                  <a
                    href="https://vietnam.un.org/vi"
                    target="_blank"
                    className="w-full py-3 px-2 h-full flex justify-between items-center"
                  >
                    <h1 className="text-ascent-1">{t("Chính sách cookies")}</h1>
                    <FaArrowUpRightFromSquare
                      size={20}
                      className="text-bgStandard"
                    />
                  </a>
                </div>
              </CustomTabPanel>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
