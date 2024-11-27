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
import { CATEGORY_API } from '@/utils/API-ROUTES'
import { ArrowLeft, Loader } from 'lucide-react'
import { useTheme } from '@/store/useTheme'
import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageLoader from '../PageLoader'

interface FormValues {
    categoryName: string;
    categoryDescription?: string;
    categoryImage: File | null;
}

const formSchema = z.object({
    categoryName: z.string(),
    categoryDescription: z.string().optional(),
    categoryImage: z.instanceof(File),
});

interface CategoryFormProps {
    isEditMode?: boolean;
}

const formSingular = "Category";
//const formPlural = "Categories";

export default function CategoryForm({ isEditMode = false }: CategoryFormProps) {
    const { isDarkMode } = useTheme();

    const { id } = useParams();

    // get query params
    const [queryParams] = useSearchParams();
    const ref = queryParams.get('ref');


    const { data: categoryData, refetch: fetchCategoryData, isLoading: isCategoryLoading } = useQuery({
        queryKey: ['category', id],
        queryFn: () => axiosInstance.get(`${CATEGORY_API}/${id}`),
        enabled: false // Prevent auto-fetching
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryName: '',
            categoryDescription: '',
            categoryImage: null
        },
    });

    useEffect(() => {
        if (!isEditMode) {
            form.reset({
                categoryName: '',
                categoryDescription: '',
                categoryImage: null
            });
        }
    }, [isEditMode, form]);

    useEffect(() => {
        if (id && isEditMode) {
            fetchCategoryData();
        }
    }, [id, isEditMode, fetchCategoryData]);

    useEffect(() => {
        if (categoryData?.data?.data) {
            const category = categoryData.data.data;
            const logoUrl = category.logo.url;

            // Download and convert logo URL to File object
            if (logoUrl) {
                fetch(logoUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "logo.png", { type: "image/png" });
                        form.reset({
                            categoryName: category.name || '',
                            categoryDescription: category.description || '',
                            categoryImage: file
                        });
                    })
                    .catch(err => {
                        console.error("Error downloading logo:", err);
                        form.reset({
                            categoryName: category.name || '',
                            categoryDescription: category.description || '',
                            categoryImage: null
                        });
                    });
            } else {
                form.reset({
                    categoryName: category.name || '',
                    categoryDescription: category.description || '',
                    categoryImage: null
                });
            }

            // setExistingImage(logoUrl || null);
        }
    }, [categoryData]);

    const categoryMutation = useMutation({
        mutationFn: (data: FormValues) => {
            const formData = new FormData();
            formData.append('name', data.categoryName);
            if (data.categoryDescription) formData.append('description', data.categoryDescription);
            if (data.categoryImage) {
                formData.append('logo', data.categoryImage);
            }

            const apiUrl = isEditMode ? `${CATEGORY_API}/${id}` : CATEGORY_API;
            const method = isEditMode ? 'put' : 'post';

            return axiosInstance[method](apiUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            status === "success" ? toast.success(message) : toast.error(message);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : error),
    });

    function onSubmit(values: FormValues) {
        try {
            categoryMutation.mutate(values);
        } catch (error) {
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    const navigate = useNavigate();

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}>

            {
                (isEditMode || ref === 'product') && (
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
                )
            }

            {
                (isEditMode && isCategoryLoading) && <PageLoader />
            }

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-lg p-6 space-y-4">

                    <FormField
                        control={form.control}
                        name="categoryName"
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
                        name="categoryDescription"
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

                    <FormField
                        control={form.control}
                        name="categoryImage"
                        render={() => (
                            <FormItem>
                                <FormLabel>{formSingular} Image</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        name="categoryImage"
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

                    <Button type="submit" disabled={categoryMutation.isPending}>
                        {categoryMutation.isPending ? (
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
