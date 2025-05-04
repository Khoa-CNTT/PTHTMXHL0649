import { useEffect, useState } from "react";
import { WrapperModal } from "./style";
import { FaEarthAmericas } from "react-icons/fa6";
import { Button } from "..";
import * as PostService from "~/services/PostService";

const ChangeVisibility = ({
  openChange,
  handleClose,
  closeMenu,
  post,
  handleRefetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(post?.visibility);

  useEffect(() => {
    if (openChange) {
      closeMenu();
    }
  }, [openChange, closeMenu]);

  const handleChecked = (visibility) => {
    setChecked(visibility);
  };

  const handleChangeVisibility = async () => {
    setLoading(true);
    try {
      const res = await PostService.changeVisibility({
        id: post?.id,
        visibility: checked,
      });
      if (res) {
        handleRefetch(true);
      }
    } catch (error) {
      console.error("Failed to update visibility:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperModal
      centered
      footer
      open={openChange}
      onCancel={handleClose}
      closable={false}
    >
      <div
        className="shadow-newFeed w-full bg-primary rounded-3xl"
        style={{
          backgroundImage: "url(/group.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-center gap-5 px-5 py-4">
          <span className="text-lg font-semibold text-ascent-1">
            Change visibility
          </span>
        </div>
        <div className="w-full border-t-[0.1px] border-borderNewFeed" />

        {/* Body */}
        <div className="w-full flex flex-col py-2 gap-y-2">
          {/* PUBLIC */}
          <div
            onClick={() => handleChecked("PUBLIC")}
            className="w-full flex items-center justify-between p-5 hover:bg-[rgba(59,130,246,0.1)] cursor-pointer"
          >
            <div className="w-full flex items-center gap-4">
              <FaEarthAmericas size={30} />
              <div className="w-full flex flex-col">
                <span className="font-semibold text-ascent-1">PUBLIC</span>
                <span className="text-xs text-ascent-2">
                  Ai cũng có thể thấy
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="visibility"
              className="w-5 h-5 cursor-pointer"
              checked={checked === "PUBLIC"}
              readOnly
            />
          </div>

          {/* PRIVATE */}
          <div
            onClick={() => handleChecked("PRIVATE")}
            className="w-full flex items-center justify-between p-5 hover:bg-[rgba(59,130,246,0.1)] cursor-pointer"
          >
            <div className="w-full flex items-center gap-4">
              <FaEarthAmericas size={30} />
              <div className="w-full flex flex-col">
                <span className="font-semibold text-ascent-1">PRIVATE</span>
                <span className="text-xs text-ascent-2">
                  Chỉ mình tôi nhìn thấy
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="visibility"
              className="w-5 h-5 cursor-pointer"
              checked={checked === "PRIVATE"}
              readOnly
            />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-end p-5">
          <Button
            type="submit"
            title={loading ? "Đang cập nhật..." : "Xong"}
            className="bg-bgColor relative text-ascent-1 px-5 py-3 rounded-xl border-borderNewFeed border-1 font-semibold text-sm shadow-newFeed"
            onClick={handleChangeVisibility}
            disabled={loading}
          />
        </div>
      </div>
    </WrapperModal>
  );
};

export default ChangeVisibility;
