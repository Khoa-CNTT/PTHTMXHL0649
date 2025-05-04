import { useNavigate } from "react-router-dom";
import { BlankAvatar } from "~/assets/index";
import { BsPersonFillAdd } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { UpdateUser } from "..";
import useGetFriendOfUser from "~/hooks/useGetFriendOfUser";
import { IoInformationCircleOutline } from "react-icons/io5";
import { Image } from "antd";
import { PiHandHeart } from "react-icons/pi";
import _ from "lodash";
import { useSelector } from "react-redux";

const ProfileCard = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { friendOfUser } = useGetFriendOfUser();

  return (
    <div className="w-full bg-primary flex flex-col items-center rounded-3xl px-6 py-4 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed ">
      <div className="w-full flex items-center justify-between border-b pb-5 border-[#66666645]">
        <div
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="flex w-full cursor-pointer items-center gap-x-2"
        >
          <div className="h-[50px] w-[50px] border-1 border-borderNewFeed overflow-hidden rounded-full shadow-newFeed">
            <img
              src={user?.avatar || BlankAvatar}
              alt="avatar"
              className="h-full w-full object-cover bg-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-y-1">
            <span className="text-base font-semibold text-ascent-1">
              {user?.username}
            </span>
            <span className="text-ascent-2 text-sm">
              {user?.firstName + " " + user?.lastName || "No name"}
            </span>
          </div>
        </div>
        <div>
          {user?.token ? (
            <UpdateUser profileCard />
          ) : (
            <button
              className="bg-bluePrimary text-sm text-white p-1 rounded"
              onClick={() => {}}
            >
              <BsPersonFillAdd size={20} className="text-[#0f52b6]" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
        <div className="flex gap-2 items-center text-ascent-2">
          <IoInformationCircleOutline className="text-xl text-ascent-1" />
          <span>
            {_.truncate(user?.bio || t("Thêm tiểu sử"), {
              length: 30,
              omission: "...",
            })}
          </span>
        </div>

        <div className="flex gap-2 items-center text-ascent-2">
          <CiLocationOn className="text-xl text-ascent-1" />
          <span>{user?.city || t("Thêm địa chỉ")}</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
        <p className="text-lg text-ascent-1 font-semibold lowercase">
          {friendOfUser?.length} {t("bạn bè")}
        </p>

        <span className="text-base text-bgStandard">
          {user?.emailVerified ? t("Đã xác thực") : t("Chưa xác thực")}
        </span>

        <div className="flex items-center justify-between">
          <span className="text-ascent-2">{t("Tham gia")}</span>
          <span className="text-ascent-1 text-base">
            {moment(user?.createdAt).fromNow() || "none"}
          </span>
        </div>
      </div>
      <div className="w-full flex flex-col py-4">
        <ul className="w-full flex flex-col">
          <li
            onClick={() => navigate("/fundraisers")}
            className="w-full flex hover:bg-hoverItem py-2 rounded-xl cursor-pointer items-center"
          >
            <div className="w-full flex gap-4 px-1">
              <PiHandHeart size={21} className="text-red-600" />
              <span className="text-ascent-1  text-base">
                {t("Chiến dịch gây quỹ")}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileCard;
