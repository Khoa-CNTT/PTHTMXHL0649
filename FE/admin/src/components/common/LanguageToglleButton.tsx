import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../../redux/Slices/languageSlice";
import i18n from "../../utils/i18n/i18n";

const LanguageToglleButton = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "vie" : "en";
    dispatch(setLanguage(newLanguage));
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {language === "en" ? (
        <img src="/flag-en.svg" alt="" className="w-6 h-6" />
      ) : (
        <img src="/flag-vie.svg" alt="" className="w-6 h-6" />
      )}
    </button>
  );
};

export default LanguageToglleButton;
