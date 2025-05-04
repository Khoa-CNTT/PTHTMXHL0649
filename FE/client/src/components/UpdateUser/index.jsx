import React, { useEffect, useState } from "react";
import { Button } from "..";
import { useDispatch, useSelector } from "react-redux";
import { useMutationHook } from "~/hooks/useMutationHook";
import { Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LiaEditSolid } from "react-icons/lia";
import * as UserService from "~/services/UserService";
import { Input, message, Typography } from "antd";
import { updateUser } from "~/redux/Slices/userSlice";
import { ImUserPlus } from "react-icons/im";
import TextArea from "antd/es/input/TextArea";
import CustomModal from "~/components/CustomModal";
import { PlusCircle } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const UpdateUser = ({ profile, profileCard }) => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const [show, setShow] = useState("");
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const handleDialog = () => setShow((prev) => !prev);
  const onChangeFirstName = (e) => setFirstName(e.target.value);
  const onChangeLastName = (e) => setLastName(e.target.value);
  const onChangeBio = (e) => setBio(e.target.value);
  const onChangeCity = (e) => setCity(e.target.value);
  const onChangePhoneNumber = (e) => setPhoneNumber(e.target.value);

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPhoneNumber(user?.phoneNumber || "");
    setCity(user?.city || "");
    setBio(user?.bio || "");
  }, [user]);

  const mutation = useMutationHook((data) => UserService.update(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      setShow(false);
      dispatch(updateUser({ ...data?.result, token: user?.token }));
      message.open({
        type: "success",
        content: t("Chỉnh sửa thông tin người dùng thành công"),
      });
    }
  }, [isSuccess]);

  const mutationUpdateAvatar = useMutationHook((data) =>
    UserService.setAvatar({ data })
  );
  const {
    data: dataUpdateAvatar,
    isPending: isPendingAvatar,
    isSuccess: isSuccessUpdateAvatar,
  } = mutationUpdateAvatar;

  useEffect(() => {
    if (isPendingAvatar) {
      message.open({
        type: "loading",
        content: "Updating avatar...",
      });
    } else if (isSuccessUpdateAvatar) {
      handleGetDetailUser({ id: user?.id, token: user?.token });
      message.open({
        type: "success",
        content: dataUpdateAvatar,
      });
    }
  }, [isSuccessUpdateAvatar, isPendingAvatar]);

  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    const request = {
      content: user?.username + t("vừa cập nhật ảnh đại diện"),
      visibility: "PRIVATE",
    };
    const data = { request, file };
    mutationUpdateAvatar.mutate(data);
  };

  const onSubmit = () => {
    const data = {
      firstName,
      lastName,
      bio,
      phoneNumber,
      city,
    };
    mutation.mutate(data);
  };

  const handleGetDetailUser = async ({ id, token }) => {
    const res = await UserService.getDetailUserByUserId({ id });
    dispatch(updateUser({ ...res?.result, token }));
  };

  return (
    <>
      {profile && (
        <Button
          onClick={handleDialog}
          title={t("Chỉnh sửa trang cá nhân")}
          className={
            "text-ascent-1 w-full active:scale-90 transition-transform py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
          }
        />
      )}

      {profileCard && (
        <LiaEditSolid
          size={22}
          className="text-bgStandard cursor-pointer"
          onClick={handleDialog}
        />
      )}

      <CustomModal
        className="w-[550px] border-1 border-borderNewFeed rounded-2xl mx-auto shadow-newFeed bg-primary"
        isOpen={show}
        onClose={handleDialog}
      >
        {/* <div className="w-[550px] border-1 border-borderNewFeed rounded-2xl mx-auto shadow-newFeed bg-primary"> */}
        <form className="flex w-full flex-col px-8 py-3">
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col">
              <span className="text-ascent-1 text-left text-sm mb-1">
                {t("Họ")}
              </span>
              <Input
                count={{
                  show: true,
                  max: 30,
                }}
                className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                value={firstName}
                onChange={onChangeFirstName}
                minLength={1}
                maxLength={30}
                name="firstName"
                placeholder="Add first name"
              />
            </div>
            {user?.avatar ? (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bgSearch relative">
                <img
                  src={user?.avatar}
                  alt="avatar"
                  className="w-12 h-12 object-cover rounded-full"
                />

                <input
                  type="file"
                  onChange={handleChangeAvatar}
                  className="hidden"
                  id="imgUpload"
                  data-max-size="5120"
                  accept=".jpg, .png, .jpeg"
                />

                <div
                  className="absolute bottom-0 right-0 bg-primary rounded-full flex items-center justify-center cursor-pointer border border-white shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("imgUpload")?.click();
                  }}
                >
                  <FiPlus className="text-ascent-1" size={12} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bgSearch">
                <label
                  htmlFor="imgUpload"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleChangeAvatar}
                    className="hidden"
                    id="imgUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg"
                  />
                  <ImUserPlus />
                </label>
              </div>
            )}
          </div>

          <div className="w-full border-t border-borderNewFeed"></div>

          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col">
              <span className="text-ascent-1 text-left text-sm mb-1">
                {t("Tên")}
              </span>
              <Input
                className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                count={{
                  show: true,
                  max: 30,
                }}
                value={lastName}
                onChange={onChangeLastName}
                minLength={1}
                maxLength={30}
                name="lastName"
                placeholder="Add last name"
              />
            </div>
          </div>

          <div className="w-full border-t border-borderNewFeed"></div>

          <div className="flex items-center  w-full justify-between py-3">
            <div className="flex w-full flex-col">
              <span className="text-ascent-1 text-left text-sm mb-1">
                {t("Tiểu sử")}
              </span>

              <TextArea
                showCount
                name="bio"
                className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                value={bio}
                onChange={onChangeBio}
                maxLength={100}
                placeholder={t("Thêm tiểu sử")}
              />
            </div>
          </div>

          <div className="w-full border-t border-borderNewFeed mt-4"></div>

          <div className="flex items-center w-full justify-between py-3">
            <div className="flex w-full flex-col">
              <span className="text-ascent-1 text-left text-sm mb-1">
                {t("Số điện thoại")}
              </span>
              <Input
                count={{
                  show: true,
                  max: 10,
                }}
                className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                value={phoneNumber}
                onChange={onChangePhoneNumber}
                maxLength={10}
                name="phoneNumber"
                placeholder={t("Thêm số điện thoại")}
              />
            </div>
          </div>

          <div className="w-full border-t border-borderNewFeed"></div>

          <div className="flex items-center  w-full justify-between py-3">
            <div className="flex w-full flex-col">
              <span className="text-ascent-1 text-left text-sm mb-1">
                {t("Địa chỉ")}
              </span>
              <Input
                count={{
                  show: true,
                  max: 50,
                }}
                className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                value={city}
                onChange={onChangeCity}
                maxLength={50}
                name="city"
                placeholder={t("Thêm địa chỉ")}
              />
            </div>
          </div>

          <Button
            onClick={onSubmit}
            title={t("Cập nhật")}
            disable={isPending}
            isLoading={isPending}
            className="w-full  bg-bgStandard flex items-center justify-center py-3 hover:opacity-90 border-1 border-borderNewFeed rounded-xl font-medium text-primary "
          />
        </form>
        {/* </div> */}
      </CustomModal>
    </>
  );
};

export default UpdateUser;
