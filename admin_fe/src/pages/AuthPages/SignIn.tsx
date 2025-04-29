import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { APP_NAME } from "../../utils";
import { useTranslation } from "react-i18next";

export default function SignIn() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title={t(`Đăng nhập - ${APP_NAME}`)} />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
