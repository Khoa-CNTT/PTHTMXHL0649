import React from "react";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  className,
}) => {
  const { t } = useTranslation();

  const variants = {
    default: {
      confirmBtnClass: "text-blue hover:bg-blue-50 active:bg-blue",
    },
    danger: {
      confirmBtnClass: "text-red-500 hover:bg-red-50 active:bg-red-100",
    },
    warning: {
      confirmBtnClass: "text-amber-500 hover:bg-amber-50 active:bg-amber-100",
    },
    success: {
      confirmBtnClass: "text-green-500 hover:bg-green-50 active:bg-green-100",
    },
  };

  const currentVariant = variants[variant] || variants.default;

  const defaultTexts = {
    confirmText: t("OK"),
    cancelText: t("Hủy"),
  };

  const finalConfirmText = confirmText || defaultTexts.confirmText;
  const finalCancelText = cancelText || defaultTexts.cancelText;

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      className={`bg-primary ${className} flex flex-col rounded-xl shadow-lg overflow-hidden`}
    >
      <div className="px-4 pt-4 pb-3 flex flex-col items-center">
        {title && (
          <h3 className="text-lg text-ascent-1 font-semibold mb-1 text-center">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-center text-ascent-2 text-sm">{description}</p>
        )}
      </div>

      <div className="flex w-full border-t border-borderNewFeed">
        <button
          onClick={onClose}
          className="flex-1 py-3 hover:bg-hoverItem text-ascent-2 text-base font-normal border-r border-borderNewFeed"
          aria-label={finalCancelText}
        >
          {finalCancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-3 hover:bg-hoverItem font-medium text-base relative transition-colors ${currentVariant.confirmBtnClass}`}
          aria-label={finalConfirmText}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">{finalConfirmText}</span>
            </div>
          ) : (
            finalConfirmText
          )}
        </button>
      </div>
    </CustomModal>
  );
};

export default ConfirmDialog;
