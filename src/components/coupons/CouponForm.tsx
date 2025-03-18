import toast from 'react-hot-toast'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/API'
import { ArrowLeft, Loader } from 'lucide-react'
import { useTheme } from '@/store/useTheme'
import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageLoader from '../PageLoader'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { COUPON_API } from '@/utils/API-ROUTES'

enum CouponType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT = 'AMOUNT'
}



interface FormValues {
    code: string;
    discountType: CouponType;
    discountValue: number;
    maxUses?: number;
    minPurchaseAmount?: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    userIds?: number[];
    productIds?: number[];
}

const formSchema = z.object({
    code: z.string().min(3).max(20),
    discountType: z.nativeEnum(CouponType),
    discountValue: z.number().positive(),
    maxUses: z.number().int().nonnegative().optional(),
    minPurchaseAmount: z.number().positive().optional(),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean(),
    userIds: z.array(z.number()).optional(),
    productIds: z.array(z.number()).optional()
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"]
});

interface CouponFormProps {
    isEditMode?: boolean;
}

export default function CouponForm({ isEditMode = false }: CouponFormProps) {
    const { isDarkMode } = useTheme();
    const { id } = useParams();
    const [queryParams] = useSearchParams();
    const ref = queryParams.get('ref');

    const { data: couponData, refetch: fetchCouponData, isLoading: isCouponLoading } = useQuery({
        queryKey: ['coupon', id],
        queryFn: () => axiosInstance.get(`${COUPON_API}/${id}`),
        enabled: false
    });

    useEffect(() => {
        if (id && isEditMode) {
            fetchCouponData();
        }
    }, [id, isEditMode, fetchCouponData]);

    useEffect(() => {
        if (couponData?.data?.data) {
            const coupon = couponData.data.data;
            form.reset({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: Number(coupon.discountValue),
                maxUses: coupon.maxUses,
                minPurchaseAmount: Number(coupon.minPurchaseAmount),
                startDate: new Date(coupon.startDate),
                endDate: new Date(coupon.endDate),
                isActive: coupon.isActive,
                userIds: coupon.userIds,
                productIds: coupon.productIds
            });
        }
    }, [couponData]);

    const couponMutation = useMutation({
        mutationFn: (data: FormValues) => {
            const apiUrl = isEditMode ? `${COUPON_API}/${id}` : COUPON_API;
            const method = isEditMode ? 'put' : 'post';
            return axiosInstance[method](apiUrl, data);
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success" && !isEditMode) {
                form.reset();
            }
            status === "success" ? toast.success(message) : toast.error(message);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'An error occurred'),
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            discountType: CouponType.PERCENTAGE,
            discountValue: 0,
            maxUses: 0,
            minPurchaseAmount: 0,
            startDate: new Date(),
            endDate: new Date(),
            isActive: true,
            userIds: [],
            productIds: []
        },
    });

    function onSubmit(values: FormValues) {
        try {
            couponMutation.mutate(values);
        } catch (error) {
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    const navigate = useNavigate();

    return (
        <div className={`w-full relative h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}>
            {(isEditMode || ref === 'product') && (
                <div className="p-4 pb-0">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                </div>
            )}

            {(isEditMode && isCouponLoading) && <PageLoader />}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg p-6 space-y-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Coupon Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter coupon code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={CouponType.PERCENTAGE}>Percentage</SelectItem>
                                        <SelectItem value={CouponType.AMOUNT}>Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount Value</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxUses"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Uses</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="minPurchaseAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Purchase Amount</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="datetime-local" 
                                        {...field}
                                        onChange={e => field.onChange(new Date(e.target.value))}
                                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="datetime-local" 
                                        {...field}
                                        onChange={e => field.onChange(new Date(e.target.value))}
                                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active Status</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={couponMutation.isPending}>
                        {couponMutation.isPending ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            isEditMode ? "Update Coupon" : "Create Coupon"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
