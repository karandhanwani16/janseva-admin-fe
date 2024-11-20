import { Check, ChevronDown } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SelectOptions {
    value: string;
    label: string;
}

interface SelectWithSearchProps {
    data: SelectOptions[];
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    name?: string;
}

const SelectWithSearch = forwardRef<HTMLDivElement, SelectWithSearchProps>(({ 
    data, 
    label,
    value: controlledValue,
    onChange,
    onBlur,
    name
}, ref) => {

    const [open, setOpen] = useState<boolean>(false);
    const [value, setValue] = useState<string>(controlledValue || "");

    useEffect(() => {
        if (controlledValue !== undefined) {
            setValue(controlledValue);
        }
    }, [controlledValue]);

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue;
        setValue(newValue);
        setOpen(false);
        
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="space-y-2" ref={ref}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="select-41"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-background px-3 font-normal hover:bg-background"
                        onBlur={onBlur}
                        name={name}
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value
                                ? data.find((item: SelectOptions) => item.value === value)?.label
                                : `Select ${label}`}
                        </span>
                        <ChevronDown
                            size={16}
                            strokeWidth={2}
                            className="shrink-0 text-muted-foreground/80"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder={`Search ${label}...`} />
                        <CommandList>
                            <CommandEmpty>No {label} found.</CommandEmpty>
                            <CommandGroup>
                                {data.map((item: SelectOptions) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={handleSelect}
                                    >
                                        {item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === item.value ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
});

SelectWithSearch.displayName = "SelectWithSearch";

export default SelectWithSearch;
