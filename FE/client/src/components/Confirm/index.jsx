import { useTranslation } from "react-i18next";
import { Loading } from "..";
import CustomModal from "~/components/CustomModal";

const Confirm = ({
  open,
  handleClose,
  handleSubmit,
  title = "",
  desc = "",
  titleBtn = "",
  cancelBtn = "",
  isPending,
  variant = "danger",
  icon,
}) => {
  const { t } = useTranslation();

  const variantStyles = {
    danger: {
      button: "text-red-500 hover:bg-red-50",
      icon: icon || "⚠️",
    },
    warning: {
      button: "text-amber-500 hover:bg-amber-50",
      icon: icon || "⚠️",
    },
    info: {
      button: "text-blue-500 hover:bg-blue-50",
      icon: icon || "ℹ️",
    },
    success: {
      button: "text-green-500 hover:bg-green-50",
      icon: icon || "✓",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="bg-white w-full flex flex-col rounded-xl shadow-lg overflow-hidden">
        {/* Icon and Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center">
          {currentVariant.icon && (
            <div className="text-2xl mb-3">{currentVariant.icon}</div>
          )}
          <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
          {desc && (
            <p className="text-center text-gray-600 text-base">{desc}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full border-t mt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-4 px-4 text-ascent-1 font-medium border-r hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-inset"
            aria-label={cancelBtn || t("Hủy")}
          >
            {cancelBtn || t("Hủy")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={`flex-1 py-4 px-4 font-semibold relative transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${currentVariant.button}`}
            aria-label={titleBtn}
          >
            {isPending ? (
              <span className="opacity-0">{titleBtn}</span>
            ) : (
              titleBtn
            )}
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loading />
              </div>
            )}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default Confirm;
