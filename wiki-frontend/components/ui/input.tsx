// components/ui/Input.tsx
import * as React from "react";
import { TextInput, TextInputProps } from "react-native";
import { cn } from "@/lib/utils"; // si usas NativeWind o tu helper de clases

interface InputProps extends TextInputProps {
    className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <TextInput
                ref={ref}
                {...props}
                className={cn(
                    "h-10 w-full rounded-md border border-gray-300 px-3 text-base text-black dark:text-white bg-white dark:bg-gray-800",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-400",
                    "placeholder:text-gray-400",
                    className
                )}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
