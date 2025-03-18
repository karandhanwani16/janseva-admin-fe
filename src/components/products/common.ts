import { z } from "zod";
export const productVariationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0.01, "Price must be greater than 0"),
    discountedPrice: z.number().min(0, "Discounted price cannot be negative"),
    discountType: z.literal("percentage"),
    stock: z.number().min(0, "Stock cannot be negative"),
    units: z.number().min(1, "Units must be at least 1")
}).refine((data) => {
    return data.discountedPrice <= data.price;
}, {
    message: "Discounted price must be less than or equal to regular price",
    path: ["discountedPrice"]
});
