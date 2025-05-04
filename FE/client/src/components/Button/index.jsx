import { Loading } from "~/components";

const Button = ({
  title,
  className,
  iconRight,
  iconLeft,
  iconLeftStyles,
  titleStyles,
  type,
  onClick,
  disable,
  isLoading = false,
  ...rests
}) => {
  return (
    <button
      {...rests}
      disabled={disable || isLoading}
      onClick={onClick}
      type={type || "button"}
      className={`inline-flex items-center justify-center text-base relative ${className} ${
        (disable || isLoading) && "cursor-not-allowed"
      }`}
    >
      {iconLeft && <div className={` ${iconLeftStyles}`}>{iconLeft}</div>}
      <span className={`${titleStyles} ${isLoading ? "invisible" : ""}`}>
        {title}
      </span>
      {isLoading && <Loading className="absolute" />}{" "}
      {iconRight && <div className="ml-2">{iconRight}</div>}
    </button>
  );
};

export default Button;
