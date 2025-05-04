import { useEffect, useState } from "react";
import { Button, Card } from "antd";
import { LuSendHorizontal } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import * as AIService from "~/services/AIService";
import { Input, Popover, message } from "antd";

const AISuggestions = ({ onSelectContent }) => {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      message.warning("Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
      const res = await AIService.suggestContent({ content: prompt });
      if (res?.result?.length > 0) {
        setSuggestions(res.result);
        setSelectedIndex(null);
      } else {
        message.info("No suggestions found. Try a different prompt.");
      }
    } catch (error) {
      message.error("Failed to get suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContent = (content, index) => {
    setSelectedIndex(index);
    onSelectContent(content);
  };

  const aiSuggestionsContent = (
    <div className={`flex flex-col gap-4 p-2 ${isMobile ? "w-full" : "w-96"}`}>
      <div className="flex items-center gap-2">
        <Input
          placeholder={
            isMobile
              ? t("Enter your idea...")
              : t("Enter your idea and let AI suggest content...")
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onPressEnter={handleSubmit}
          disabled={loading}
          maxLength={200}
          className="flex-grow"
        />
        <Button
          icon={<LuSendHorizontal />}
          onClick={handleSubmit}
          loading={loading}
          type="primary"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-pulse">{t("Generating suggestions...")}</div>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-ascent-1">
            {t("Select one suggestion:")}
          </div>
          <div
            className={`overflow-y-auto ${isMobile ? "max-h-48" : "max-h-60"}`}
          >
            {suggestions.map((suggestion, index) => (
              <Card
                key={index}
                hoverable
                className={`cursor-pointer border-borderNewFeed mb-2 ${
                  selectedIndex === index ? "border-primary border-2" : ""
                }`}
                onClick={() => handleSelectContent(suggestion, index)}
                size={isMobile ? "small" : "default"}
              >
                <div className="flex justify-between items-start">
                  <div className={`${isMobile ? "text-xs" : "text-sm"}`}>
                    {suggestion}
                  </div>
                  {selectedIndex === index && (
                    <FaCheck className="text-primary mt-1" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={aiSuggestionsContent}
      trigger="click"
      placement={isMobile ? "bottom" : "bottomLeft"}
      title={
        <div className="flex items-center gap-2">
          <RiGeminiFill className="text-ascent-2" size={16} />
          <span>{t("AI Content Suggestions")}</span>
        </div>
      }
      overlayClassName={isMobile ? "mobile-ai-suggestions-popover" : ""}
      overlayStyle={
        isMobile ? { width: "calc(100vw - 32px)", maxWidth: "100%" } : {}
      }
    >
      <RiGeminiFill
        size={19}
        className="cursor-pointer text-ascent-2 hover:text-primary transition-colors"
      />
    </Popover>
  );
};

export default AISuggestions;
