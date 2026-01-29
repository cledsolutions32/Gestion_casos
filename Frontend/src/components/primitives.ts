import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      primary:"text-primary",
      blue: "text-blue",
      red: "text-red",
      gray: "text-gray",
      green: "text-green",
      orange: "text-orange",
      black: "text-black",
      default: "text-text",
      text: "text-text",
    },
    fontWeight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    size: {
      sm: "text-[14px] lg:text-[16px]",
      md: "text-[16px] lg:text-[18px]",
      lg: "text-[18px] lg:text-[20px]",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
    color: "text",
  },
});


export const pharagraph = tv({
  base: "text-sm",
  variants: {
    size: {
      sm: "text-[14px] lg:text-[16px]",
      md: "text-[16px] lg:text-[18px]",
      lg: "text-[18px] lg:text-[20px]",
    },
    color: {
      gray: "text-gray-light",
      default: "text-text",
      text: "text-text",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "default",
  },
});
