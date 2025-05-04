import React, { useEffect } from "react";
import CustomModal from "~/components/CustomModal";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaUpload, FaImage, FaTimes } from "react-icons/fa";
import { Button } from "~/components";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as FundraisingService from "~/services/FundraisingService";

const CreateCampaign = ({ open, handleClose, onSuccessCreateCampaign }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (value) => {
    const digits = value.replace(/\D/g, "");

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCurrencyChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatCurrency(value);

    setFormData({
      ...formData,
      targetAmount: formattedValue,
    });

    if (errors.targetAmount) {
      setErrors({
        ...errors,
        targetAmount: "",
      });
    }
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("Title is required");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("Description is required");
    } else if (formData.description.trim().length <= 50) {
      newErrors.description = t("Description should be at least 50 characters");
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = t("Target amount is required");
    }

    if (!imagePreview) {
      newErrors.image = t("Please upload at least one image");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutationCreateCampaign = useMutationHook((data) =>
    FundraisingService.createCampaign(data)
  );

  const { data, isPending, isSuccess } = mutationCreateCampaign;

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      onSuccessCreateCampaign();
    }
  }, [isSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      mutationCreateCampaign.mutate({
        request: {
          ...formData,
          targetAmount: parseInt(formData.targetAmount.replace(/,/g, ""), 10),
        },
        files: file,
      });
    }
  };
  return (
    <CustomModal
      className="bg-primary bg-[url(/together.png)] bg-cover bg-center shadow-sm max-h-[90vh] rounded-3xl border-1 border-borderNewFeed overflow-y-auto"
      isOpen={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        {/* Form body */}
        <div className="w-full flex items-center justify-between gap-5 px-6 py-4">
          <button
            onClick={handleClose}
            className="text-base hover:opacity-90 font-medium text-ascent-2"
          >
            {t("Hủy")}
          </button>
          <span className="text-lg font-semibold text-ascent-1">
            {t("Tạo chiến dịch")}
          </span>
          <div className="w-7" />
        </div>
        <div className="w-full border-t-[0.1px] border-borderNewFeed" />
        <div className="p-6">
          {/* Campaign Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Campaign Title")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t(
                "Enter a clear, descriptive title for your campaign"
              )}
              className={`block w-full bg-primary px-4 py-3 rounded-lg border-1 border-borderNewFeed ${
                errors.title
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Campaign Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Campaign Description")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder={t(
                "Describe your campaign goals, purpose, and how the funds will be used"
              )}
              className={`block w-full border-1 border-borderNewFeed px-4 py-3 rounded-lg ${
                errors.description
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors`}
            />
            <div className="mt-1 flex justify-between">
              <p className="text-sm text-gray-500">{t("Min 50 characters")}</p>
              <p className="text-sm text-gray-500">
                {formData.description.length} {t("characters")}
              </p>
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Target Amount */}
          <div className="mb-6">
            <label
              htmlFor="targetAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Target Amount")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₫</span>
              </div>
              <input
                type="text"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleCurrencyChange}
                placeholder="0"
                className={`block border-1 border-borderNewFeed w-full pl-8 pr-4 py-3 rounded-lg ${
                  errors.targetAmount
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } shadow-sm focus:outline-none focus:ring-2 transition-colors`}
              />
            </div>
            {errors.targetAmount ? (
              <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                {t("Set a realistic funding goal for your campaign")}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Campaign Image")} <span className="text-red-500">*</span>
            </label>

            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 bg-bgSearch hover:border-indigo-400"
                } transition-colors cursor-pointer text-center`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <FaUpload className="text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    {t("Drag and drop an image here")}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {t("or click to browse files")}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <FaImage className="mr-2" /> {t("Browse Image")}
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Campaign preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="text-gray-700" />
                </button>
              </div>
            )}

            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t(
                "Upload a compelling image that represents your campaign (recommended size: 1200x630px)"
              )}
            </p>
          </div>
        </div>

        {/* Form actions */}
        <div className="px-6 py-4 bg-transparent border-t border-gray-200 flex justify-end">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
            >
              {t("Cancel")}
            </button>
            {/* <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              {t("Create Campaign")}
            </button> */}

            <Button
              isLoading={isPending}
              type="submit"
              title={t("Create Campaign")}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            />
          </div>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateCampaign;
