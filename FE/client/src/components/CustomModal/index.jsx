import { useEffect, useRef } from "react";

const CustomModal = ({
  isOpen,
  onClose,
  closeOnClickOutside = true,
  children,
  className = "",
}) => {
  const modalRef = useRef();

  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeOnClickOutside, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div ref={modalRef} className={` ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default CustomModal;
