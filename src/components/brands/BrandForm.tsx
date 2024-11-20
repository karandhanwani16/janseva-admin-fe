
import toast from 'react-hot-toast'
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Input
} from "@/components/ui/input"
import {
    Textarea
} from "@/components/ui/textarea"
import FileUpload from "../Fileupload/FileUpload"
import { useMutation, useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/API'
import { BRAND_API } from '@/utils/API-ROUTES'
import { ArrowLeft, Loader } from 'lucide-react'
import { useTheme } from '@/store/useTheme'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface FormValues {
    brandName: string;
    brandDescription?: string;
    brandImage?: File[] | null;
}

const formSchema = z.object({
    brandName: z.string(),
    brandDescription: z.string().optional(),
    brandImage: z.array(z.instanceof(File)).nullable().optional(),
});

interface BrandFormProps {
    isEditMode?: boolean;
}

const formSingular = "Company";
//const formPlural = "Companies";

export default function BrandForm({ isEditMode = false }: BrandFormProps) {
    const { isDarkMode } = useTheme();


    const { id } = useParams();

    const { data: brandData, refetch: fetchBrandData } = useQuery({
        queryKey: ['brand', id],
        queryFn: () => axiosInstance.get(`${BRAND_API}/${id}`),
        enabled: false // Prevent auto-fetching
    });

    useEffect(() => {
        if (id && isEditMode) {
            fetchBrandData();

        }
    }, [id, isEditMode, fetchBrandData]);

    useEffect(() => {
        if (brandData?.data?.data) {
            const brand = brandData.data.data;
            const logoUrl = brand.logo.url;

            // Download and convert logo URL to File object
            if (logoUrl) {
                fetch(logoUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "logo.png", { type: "image/png" });
                        form.reset({
                            brandName: brand.name || '',
                            brandDescription: brand.description || '',
                            brandImage: [file]
                        });
                    })
                    .catch(err => {
                        console.error("Error downloading logo:", err);
                        form.reset({
                            brandName: brand.name || '',
                            brandDescription: brand.description || '',
                            brandImage: null
                        });
                    });
            } else {
                form.reset({
                    brandName: brand.name || '',
                    brandDescription: brand.description || '',
                    brandImage: null
                });
            }

            // setExistingImage(logoUrl || null);
        }
    }, [brandData]);

    const brandMutation = useMutation({
        mutationFn: (data: FormValues) => {
            const formData = new FormData();
            formData.append('name', data.brandName);
            if (data.brandDescription) formData.append('description', data.brandDescription);
            if (data.brandImage && data.brandImage.length > 0) {
                formData.append('logo', data.brandImage[0]);
            }

            const apiUrl = isEditMode ? `${BRAND_API}/${id}` : BRAND_API;
            const method = isEditMode ? 'put' : 'post';

            return axiosInstance[method](apiUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success" && !isEditMode) {
                form.reset();
            }
            status === "success" ? toast.success(message) : toast.error(message);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : error),
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brandName: '',
            brandDescription: '',
            brandImage: null
        },
    });

    function onSubmit(values: FormValues) {
        try {
            brandMutation.mutate(values);
        } catch (error) {
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    const navigate = useNavigate();

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}>

            {
                isEditMode && (
                    <div className="p-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Button>
                    </div>
                )
            }

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg p-6 space-y-4">

                    <FormField
                        control={form.control}
                        name="brandName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{formSingular} Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={`Enter ${formSingular} Name`}
                                        type="text"
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="brandDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{formSingular} Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={`Enter ${formSingular} Description`}
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* eslint-disable-next-line no-unused-vars */}
                    <FormField
                        control={form.control}
                        name="brandImage"
                        render={() => (
                            <FormItem>
                                <FormLabel>{formSingular} Image</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        name="brandImage"
                                        control={form.control}
                                        // existingImage={existingImage}
                                        multiple={false}
                                        maxFiles={1}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={brandMutation.isPending}>
                        {brandMutation.isPending ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? "Updating..." : "Uploading..."}
                            </>
                        ) : (
                            isEditMode ? "Update" : "Upload"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
