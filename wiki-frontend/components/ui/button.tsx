// components/ui/Button.tsx
import * as React from "react";
import { Pressable, Text, PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center rounded-md font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white",
        destructive: "bg-red-600 text-white",
        outline: "border border-gray-300 bg-transparent text-gray-900 dark:text-white",
        secondary: "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
        ghost: "bg-transparent text-gray-900 dark:text-white",
        link: "text-blue-600 underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3",
        lg: "h-12 px-6",
        icon: "h-10 w-10 p-0 items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends PressableProps,
  VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        <Text
          className={cn(
            "text-sm font-medium",
            variant === "link" ? "text-blue-600" : "text-white"
          )}
        >
          {children}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
