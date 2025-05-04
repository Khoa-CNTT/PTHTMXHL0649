import { Tooltip } from "antd";
import React, { useEffect, useState } from "react";

const TextInput = React.forwardRef(
  (
    {
      type,
      placeholder,
      styles,
      label,
      labelStyles,
      register,
      name,
      error,
      value,
      onChange,
      iconRight,
      iconRightStyles,
      iconLeft,
      iconLeftStyles,
      toolTip,
      toolTipInput,
      stylesContainer,
      ...rest
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the standard md breakpoint
    };

    useEffect(() => {
      checkIsMobile(); // Check on initial render
      window.addEventListener("resize", checkIsMobile);

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    }, []);

    const renderInput = (withTooltip = false) => (
      <input
        onChange={onChange}
        value={value}
        type={type}
        placeholder={placeholder}
        name={name}
        ref={ref}
        {...rest}
        className={`rounded text-ascent-1 border-1 border-borderNewFeed outline-none text-sm px-4 py-2.5 placeholder:text-[#666]
          ${iconLeft ? "pl-10" : ""}
          ${iconRight ? "pr-10" : ""}
          ${styles}`}
        {...register}
        aria-invalid={error ? "true" : "false"}
      />
    );

    return (
      <div className={`w-full flex-col flex ${stylesContainer}`}>
        {label && (
          <p className={`text-ascent-1 text-sm mb-2 ${labelStyles}`}>{label}</p>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span
              className={`absolute left-3 text-ascent-1 flex items-center ${iconLeftStyles}`}
            >
              {iconLeft}
            </span>
          )}

          {toolTipInput && !isMobile ? (
            <Tooltip
              color="red"
              open={true}
              title={toolTipInput}
              placement="right"
            >
              {renderInput(true)}
            </Tooltip>
          ) : (
            renderInput(false)
          )}

          {iconRight && toolTip && !isMobile ? (
            <Tooltip
              color="red"
              open={true}
              title={toolTip}
              placement="topLeft"
            >
              <span
                className={`absolute right-3 text-ascent-1 flex items-center ${iconRightStyles}`}
              >
                {iconRight}
              </span>
            </Tooltip>
          ) : iconRight ? (
            <span
              className={`absolute right-3 text-ascent-1 flex items-center ${iconRightStyles}`}
            >
              {iconRight}
            </span>
          ) : null}
        </div>
        {error && (
          <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

export default TextInput;
