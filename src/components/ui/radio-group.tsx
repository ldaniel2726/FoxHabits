"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children?: React.ReactNode;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
      value || defaultValue
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (value === undefined) {
        setSelectedValue(newValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props as React.HTMLAttributes<HTMLDivElement>}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
            selectedValue,
            onSelect: handleValueChange,
          });
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps {
  className?: string;
  value: string;
  selectedValue?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, value, selectedValue, onSelect, disabled, children, ...props }, ref) => {
    const isSelected = selectedValue === value;
    
    const handleClick = () => {
      if (!disabled && onSelect) {
        onSelect(value);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <div
          ref={ref}
          role="radio"
          aria-checked={isSelected}
          data-state={isSelected ? "checked" : "unchecked"}
          onClick={handleClick}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary ring-offset-background",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isSelected && "text-primary",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              handleClick();
            }
          }}
          {...props as React.HTMLAttributes<HTMLDivElement>}
        >
          {isSelected && (
            <div className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </div>
          )}
        </div>
        {children}
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
