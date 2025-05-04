import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "..";
import { GroupAvatar } from "~/assets";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as GroupService from "~/services/GroupService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import { BiWorld, BiLock } from "react-icons/bi";
import { FiX } from "react-icons/fi";

const CreateGroup = ({ open, handleClose }) => {
  const theme = useSelector((state) => state.theme.theme);
  const [postState, setPostState] = useState("PUBLIC");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formErrors, setFormErrors] = useState({ name: false });

  const handleChangeName = (e) => {
    setName(e.target.value);
    if (e.target.value.trim()) {
      setFormErrors({ ...formErrors, name: false });
    }
  };

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const mutation = useMutationHook((data) =>
    GroupService.createGroup({ data })
  );

  const { data, isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data && data?.result) {
        navigate(`/group/${data?.result?.id}`);
      }
    }
  }, [isSuccess, isError, data, navigate]);

  const handleSubmitPost = () => {
    // Validate form
    if (!name.trim()) {
      setFormErrors({ ...formErrors, name: true });
      return;
    }

    const data = {
      name,
      description,
      visibility: postState,
    };
    mutation.mutate(data);
  };

  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const placeholderColor = isDarkMode
    ? "placeholder:text-gray-400"
    : "placeholder:text-gray-500";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const inputBgColor = isDarkMode ? "bg-gray-800" : "bg-gray-50";

  return (
    <CustomModal
      className="w-[500px] bg-[url(/group.png)] bg-center bg-cover rounded-2xl  border-1 border-borderNewFeed bg-primary"
      isOpen={open}
      onClose={handleClose}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-borderNewFeed ">
        <button
          onClick={handleClose}
          className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiX className={`w-5 h-5 ${textColor}`} />
        </button>
        <h2 className="text-xl font-bold text-center flex-1 -ml-10 text-ascent-1">
          {t("Tạo nhóm")}
        </h2>
        <div className="w-5" />
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Avatar upload section */}
        <div className="flex flex-col items-center mb-6">
          <div className="group relative cursor-pointer mb-4">
            <div className="bg-gradient-to-tr from-blue to-green-500 p-[3px] rounded-full">
              <div className="bg-white dark:bg-gray-800 p-1 rounded-full overflow-hidden">
                <img
                  className="w-24 h-24 rounded-full object-cover transition-transform group-hover:scale-105"
                  src={GroupAvatar}
                  alt="Group Avatar"
                />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <form className="space-y-5">
          <div>
            <div className="mb-1">
              <label className={`text-sm font-medium ${textColor}`}>
                {t("Tên nhóm")} <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="text"
              value={name}
              name="name"
              onChange={handleChangeName}
              placeholder={t("Nhập tên nhóm")}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${inputBgColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${placeholderColor} ${textColor} outline-none transition`}
              autoFocus
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">
                {t("Vui lòng nhập tên nhóm")}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1">
              <label className={`text-sm font-medium ${textColor}`}>
                {t("Mô tả")}
              </label>
            </div>
            <textarea
              value={description}
              onChange={handleChangeDescription}
              placeholder={t("Mô tả thông tin về nhóm của bạn")}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${inputBgColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${placeholderColor} ${textColor} outline-none transition min-h-[100px] resize-none`}
            />
          </div>

          <div>
            <div className="mb-1">
              <label className={`text-sm font-medium ${textColor}`}>
                {t("Quyền riêng tư")}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostState("PUBLIC")}
                className={`flex items-center p-3 rounded-lg ${
                  postState === "PUBLIC"
                    ? "bg-primary border-2"
                    : `border ${borderColor}`
                } transition-colors`}
              >
                <BiWorld
                  className={`w-5 h-5 mr-2 ${
                    postState === "PUBLIC" ? "text-blue" : textColor
                  }`}
                />
                <span
                  className={`font-medium ${
                    postState === "PUBLIC" ? "text-blue" : textColor
                  }`}
                >
                  {t("Công khai")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPostState("PRIVATE")}
                className={`flex items-center p-3 rounded-lg ${
                  postState === "PRIVATE"
                    ? "bg-bgStandard border-2"
                    : `border ${borderColor}`
                } transition-colors`}
              >
                <BiLock
                  className={`w-5 h-5 mr-2 ${
                    postState === "PRIVATE" ? "text-blue" : textColor
                  }`}
                />
                <span
                  className={`font-medium ${
                    postState === "PRIVATE" ? "text-blue" : textColor
                  }`}
                >
                  {t("Riêng tư")}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-borderNewFeed flex justify-end">
        <button
          onClick={handleClose}
          className="px-5 py-2 rounded-lg mr-3 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium transition-colors"
        >
          {t("Hủy")}
        </button>
        <button
          type="button"
          onClick={handleSubmitPost}
          disabled={isPending}
          className="px-5 py-2 rounded-lg bg-blue hover:bg-blue text-white font-medium transition-colors relative disabled:opacity-70"
        >
          {isPending ? (
            <CircularProgress size={20} className="text-white" />
          ) : (
            t("Tạo nhóm")
          )}
        </button>
      </div>
    </CustomModal>
  );
};

export default CreateGroup;
