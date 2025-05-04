import { useMutationHook } from "@/hooks/useMutationHook";
import { Input, Modal, Typography, Button, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImUserPlus } from "react-icons/im";
import * as AdminService from "@/services/AdminService";

const UpdateUser = ({ open, handleClose, data }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const onChangeFirstName = (e) => setFirstName(e.target.value);
  const onChangeUserName = (e) => setUsername(e.target.value);
  const onChangeLastName = (e) => setLastName(e.target.value);
  const onChangeBio = (e) => setBio(e.target.value);
  const onChangeCity = (e) => setCity(e.target.value);
  const onChangePhoneNumber = (e) => setPhoneNumber(e.target.value);

  useEffect(() => {
    setUsername(data?.username || "");
    setFirstName(data?.firstName || "");
    setLastName(data?.lastName || "");
    setPhoneNumber(data?.phoneNumber || "");
    setCity(data?.city || "");
    setBio(data?.bio || "");
  }, [data, open]);

  const mutation = useMutationHook((data) =>
    AdminService.updateUserInformation(data)
  );
  const { isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      message.open({
        type: "success",
        content: t("Chỉnh sửa thông tin người dùng thành công"),
      });
    }
  }, [isSuccess]);

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

  const mutationUpdateAvatar = useMutationHook((data) =>
    AdminService.setAvatar({ data })
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
      message.success({ content: dataUpdateAvatar });
    }
  }, [isSuccessUpdateAvatar, isPendingAvatar]);

  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    const request = {
      content: data?.username + t("vừa cập nhật ảnh đại diện"),
      visibility: "PRIVATE",
    };
    const data = { request, file };
    mutationUpdateAvatar.mutate(data);
  };

  return (
    <Modal
      title="Update user information"
      centered
      className="custom-modal"
      closeIcon={false}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Save Changes
        </Button>,
      ]}
    >
      <form className="flex w-full flex-col gap-y-2">
        <div className="flex mt-2 items-center justify-between">
          <div className="flex flex-col">
            <Typography.Title level={5}>{t("Username")}</Typography.Title>
            <Input
              count={{
                show: true,
                max: 30,
              }}
              value={username}
              onChange={onChangeUserName}
              minLength={1}
              maxLength={30}
              placeholder="Add username"
            />
          </div>
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
              {data?.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt="avatar"
                  className="w-12 h-12 object-cover rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-200">
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
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Typography.Title level={5}>{t("Họ")}</Typography.Title>
            <Input
              count={{
                show: true,
                max: 30,
              }}
              value={firstName}
              onChange={onChangeFirstName}
              minLength={1}
              maxLength={30}
              placeholder="Add first name"
            />
          </div>
          <div className="flex flex-col">
            <Typography.Title level={5}>{t("Tên")}</Typography.Title>
            <Input
              count={{
                show: true,
                max: 30,
              }}
              value={lastName}
              onChange={onChangeLastName}
              minLength={1}
              maxLength={30}
              placeholder="Add last name"
            />
          </div>
        </div>

        <div className="flex items-center w-full justify-between">
          <div className="flex w-full flex-col">
            <Typography.Title level={5}>{t("Tiểu sử")}</Typography.Title>
            <TextArea
              showCount
              value={bio}
              onChange={onChangeBio}
              maxLength={100}
              placeholder={t("Thêm tiểu sử")}
            />
          </div>
        </div>

        <div className="flex items-center w-full justify-between">
          <div className="flex w-full flex-col">
            <Typography.Title level={5}>{t("Số điện thoại")}</Typography.Title>
            <Input
              count={{
                show: true,
                max: 10,
              }}
              value={phoneNumber}
              onChange={onChangePhoneNumber}
              maxLength={10}
              placeholder={t("Thêm số điện thoại")}
            />
          </div>
        </div>

        <div className="flex items-center w-full justify-between">
          <div className="flex w-full flex-col">
            <Typography.Title level={5}>{t("Địa chỉ")}</Typography.Title>
            <Input
              count={{
                show: true,
                max: 50,
              }}
              value={city}
              onChange={onChangeCity}
              maxLength={50}
              placeholder={t("Thêm địa chỉ")}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateUser;
