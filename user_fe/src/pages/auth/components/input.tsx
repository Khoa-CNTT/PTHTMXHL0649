import { Tooltip } from 'antd';
import React from 'react';

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value?: string;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: any;
  register?: any;
  iconRight?: React.ReactNode;
  iconRightStyles?: string;
  iconLeft?: React.ReactNode;
  iconLeftStyles?: string;
  toolTip?: any;
  toolTipInput?: string;
  stylesContainer?: string;
}

export default function Input({
  type,
  name,
  placeholder,
  icon,
  value,
  onChange,
  className,
  register,
  iconRight,
  iconRightStyles,
  iconLeft,
  iconLeftStyles,
  toolTip,
  toolTipInput,
  stylesContainer,
  ...rest
}: InputProps) {
  return (
    <div className="relative flex items-center">
      {iconLeft && (
        <span
          className={`absolute left-3 text-ascent-1 flex items-center ${iconLeftStyles}`}
        >
          {iconLeft}
        </span>
      )}

      {toolTipInput ? (
        <Tooltip open={true} title={toolTipInput} placement="rightBottom">
          <input
            onChange={onChange}
            value={value}
            type={type}
            placeholder={placeholder}
            name={name}
            {...rest}
            className={`w-full bg-neutral2-5 placeholder:text-tertiary base text-primary text-sm px-5 py-4 rounded-xl transition border-[1.5px] border-transparent focus:border-neutral2-10 
              ${iconLeft ? 'pl-10' : ''} 
              ${iconRight ? 'pr-10' : ''} 
              ${className}`}
            {...register}
          />
        </Tooltip>
      ) : (
        <input
          onChange={onChange}
          value={value}
          type={type}
          placeholder={placeholder}
          name={name}
          {...rest}
          className={`w-full bg-neutral2-5 placeholder:text-tertiary base text-primary text-sm px-5 py-4 rounded-xl transition border-[1.5px] border-transparent focus:border-neutral2-10 
              ${iconLeft ? 'pl-10' : ''} 
              ${iconRight ? 'pr-10' : ''} 
              ${className}`}
          {...register}
        />
      )}

      {iconRight && toolTip ? (
        <Tooltip open={true} title={toolTip} placement="rightBottom">
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
  );
}
