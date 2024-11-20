import { Input } from "@/components/ui/input";

export default function PriceInput({ ...props }) {
    const { onChange, value, ...rest } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Convert string to number and handle empty/invalid input
        const numValue = rawValue === '' ? 0 : Number(rawValue);

        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    id="input-13"
                    className="peer pe-12 ps-6"
                    placeholder="0.00"
                    onChange={handleChange}
                    value={value || ''}
                    type="number"
                    min={0}
                    step="0.01"
                    {...rest}
                />
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                    ₹
                </span>
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                    INR
                </span>
            </div>
        </div>
    );
}
