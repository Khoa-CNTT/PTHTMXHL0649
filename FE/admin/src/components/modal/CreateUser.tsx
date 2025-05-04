import { useMutationHook } from "@/hooks/useMutationHook";
import {
  Input,
  Modal,
  Typography,
  Button,
  message,
  DatePicker,
  Form,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as AdminService from "@/services/AdminService";

const CreateUser = ({ open, handleClose, data }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        username: data?.username || "",
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        email: data?.email || "",
        phoneNumber: data?.phoneNumber || "",
        dateOfBirth: data?.dateOfBirth ? new Date(data?.dateOfBirth) : null,
        password: "",
        confirmPassword: "",
      });
    }
  }, [data, open, form]);

  const mutation = useMutationHook((data) => AdminService.createUser(data));
  const { isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      message.open({
        type: "success",
        content: t("User information updated successfully"),
      });
      form.resetFields();
    }
  }, [isSuccess, handleClose, form, t]);

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const { confirmPassword, ...userData } = values;
        console.log(userData);
        // mutation.mutate(userData);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
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
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          loading={isPending}
        >
          Save Changes
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("First Name")}
            name="firstName"
            className="w-1/2"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input
              count={{
                show: true,
                max: 30,
              }}
              minLength={1}
              maxLength={30}
              placeholder="Enter first name"
            />
          </Form.Item>
          <Form.Item
            label={t("Last Name")}
            name="lastName"
            className="w-1/2"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input
              count={{
                show: true,
                max: 30,
              }}
              minLength={1}
              maxLength={30}
              placeholder="Enter last name"
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Username")}
            name="username"
            className="w-1/2"
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input
              count={{
                show: true,
                max: 30,
              }}
              placeholder="Enter username"
            />
          </Form.Item>
          <Form.Item
            label={t("Date of Birth")}
            name="dateOfBirth"
            className="w-1/2"
          >
            <DatePicker className="w-full" placeholder="Select date of birth" />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Phone Number")}
            name="phoneNumber"
            className="w-1/2"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            label={t("Email")}
            name="email"
            className="w-1/2"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Password")}
            name="password"
            className="w-1/2"
            rules={[{ required: !data, message: "Please enter password" }]}
          >
            <Input.Password
              placeholder="Enter password"
              visibilityToggle={{
                visible: passwordVisible,
                onVisibleChange: setPasswordVisible,
              }}
            />
          </Form.Item>
          <Form.Item
            label={t("Confirm Password")}
            name="confirmPassword"
            className="w-1/2"
            dependencies={["password"]}
            rules={[
              { required: !data, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm password"
              visibilityToggle={{
                visible: confirmPasswordVisible,
                onVisibleChange: setConfirmPasswordVisible,
              }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUser;
