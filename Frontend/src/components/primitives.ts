import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      primary: "text-primary",
      blue: "text-blue",
      red: "text-red",
      gray: "text-gray",
      green: "text-green",
      orange: "text-orange",
      black: "text-black",
      default: "text-text",
      text: "text-text",
      brown: "text-brown",
      white: "text-white",
      grayDark: "text-gray-dark",
    },
    fontWeight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      center: "text-center",
      left: "text-left",
      right: "text-right",
    },
    size: {
      sm: "text-[12px] lg:text-[14px]",
      md: "text-[14px] lg:text-[16px]",
      lg: "text-[16px] lg:text-[18px]",
      xl: "text-[20px] lg:text-[22px]",
      xxl: "text-[18px] lg:text-[20px]",
    },
    uppercase: {
      true: "uppercase",
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
      sm: "text-[12px] lg:text-[14px]",
      md: "text-[14px] lg:text-[16px]",
      lg: "text-[16px] lg:text-[18px]",
    },
    color: {
      gray: "text-gray-light",
      default: "text-text",
      text: "text-text",
    },
    underline: {
      true: "underline",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "default",
  },
});
