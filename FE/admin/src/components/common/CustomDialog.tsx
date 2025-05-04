import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Create a wrapper for DialogContent with custom z-index
const DialogContent = ({ className, children, ...props }) => (
  <BaseDialogContent className={`z-50 ${className || ""}`} {...props}>
    {children}
  </BaseDialogContent>
);

const CustomDialog = ({
  trigger = "Open",
  title = "",
  description = "",
  children,
  open,
  onOpenChange,
  contentClassName = "",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild={typeof trigger !== "string"}>
        {typeof trigger === "string" ? trigger : trigger}
      </DialogTrigger>
      <DialogContent className={`z-999999 ${contentClassName}`}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
