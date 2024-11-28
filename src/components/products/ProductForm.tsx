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

import { BRAND_API, CATEGORY_API } from '@/utils/API-ROUTES'

import { AlertTriangle, ArrowLeft, Loader, Pencil, Plus, X } from 'lucide-react'

import { useTheme } from '@/store/useTheme'

import { useCallback, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { Card, CardTitle, CardHeader, CardContent } from '../ui/card'

import SelectWithSearch from '@/components/SelectWithSearch'
import PriceInput from '../ui/price-input'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '../ui/dialog'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { ScrollArea } from '../ui/scroll-area'
import { TooltipContent, Tooltip, TooltipTrigger } from '../ui/tooltip'
import { TooltipProvider } from '../ui/tooltip'
import { PRODUCT_API } from '../../utils/API-ROUTES'
import PageLoader from '../PageLoader'
import RichTextEditor from '../RichTextEditor'

import {
    FormValues, DiscountType, ProductFormProps, ProductVariation
} from './types'

const productVariationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0.01, "Price must be greater than 0"),
    discount: z.number().min(0, "Discount cannot be negative"),
    discountType: z.enum(["percentage", "fixed"]),
    stock: z.number().min(0, "Stock cannot be negative"),
    units: z.number().min(1, "Units must be at least 1")
}).refine((data) => {
    if (data.discountType === "percentage") {
        return data.discount <= 100;
    }
    if (data.discountType === "fixed") {
        return data.discount < data.price;
    }
    return true;
}, {
    message: "Invalid discount - For percentage type max is 100%, for fixed type max is the price",
    path: ["discount"]
});

const productAlternativeSchema = z.object({
    productAlternativeName: z.string(),
    productAlternativeCompanyName: z.string(),
    productAlternativeContent: z.string(),
    productAlternativePrice: z.number(),
    productAlternativeDiscount: z.number(),
    productAlternativeDiscountType: z.string(),
    productAlternativeUnits: z.number(),
});

const formSchema = z.object({
    productName: z.string(),
    productDescription: z.string().optional(),
    brandId: z.string(),
    categoryId: z.string(),
    productUses: z.string(),
    productComposition: z.string(),
    productDirections: z.string(),
    productSideEffects: z.string(),
    productAdditionalInfo: z.string(),
    productRouteOfAdministration: z.string(),
    productMedActivity: z.string(),
    productPrecaution: z.string(),
    productInteractions: z.string(),
    productDosageInformation: z.string(),
    productStorage: z.string(),
    productDietAndLifestyleGuidance: z.string(),
    productHighlights: z.string(),
    productIngredients: z.string(),
    productKeyUses: z.string(),
    productHowToUse: z.string(),
    productSafetyInformation: z.string(),
    productVariations: z.array(productVariationSchema).min(1, "At least one product variation is required"),
    productImages: z.array(z.instanceof(File)).min(1, "At least one product image is required"),
    hasAlternativeProduct: z.boolean(),
    productAlternatives: z.preprocess(
        (val) => val,
        z.union([
            productAlternativeSchema,
            z.object({}).optional()
        ])
    ),
    productAlternativeImage: z.union([z.instanceof(File), z.null()])
}).refine((data) => {
    if (data.hasAlternativeProduct) {
        return data.productAlternativeImage !== null;
    }
    return true;
}, {
    message: "Alternative product image is required when alternative product is enabled",
    path: ["productAlternativeImage"]
});


const formSingular = "Product";
//const formPlural = "Products";

export default function ProductForm({ isEditMode = false }: ProductFormProps) {

    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    // getting dropdown data

    const { data: brandData } = useQuery({
        queryKey: ['form-brand'],
        queryFn: () => getDropdownData(BRAND_API)
    });

    const { data: categoryData } = useQuery({
        queryKey: ['form-category'],
        queryFn: () => getDropdownData(CATEGORY_API)
    });

    // form handling

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            brandId: "",
            categoryId: "",
            productDescription: "",
            productComposition: "",
            productUses: "",
            productDirections: "",
            productSideEffects: "",
            productAdditionalInfo: "",
            productRouteOfAdministration: "",
            productMedActivity: "",
            productPrecaution: "",
            productInteractions: "",
            productDosageInformation: "",
            productStorage: "",
            productDietAndLifestyleGuidance: "",
            productHighlights: "",
            productIngredients: "",
            productKeyUses: "",
            productHowToUse: "",
            productSafetyInformation: "",
            productVariations: [],
            productImages: null,
            hasAlternativeProduct: false,
            productAlternativeImage: null,
            productAlternatives: {
                productAlternativeName: "",
                productAlternativeCompanyName: "",
                productAlternativeContent: "",
                productAlternativePrice: 0,
                productAlternativeDiscount: 0,
                productAlternativeDiscountType: "percentage",
                productAlternativeUnits: 0
            }
        }
    });


    const productMutation = useMutation({
        mutationFn: (payload: Record<string, any>) => {

            const apiUrl = isEditMode ? `${PRODUCT_API}/${id}` : PRODUCT_API;
            const method = isEditMode ? 'put' : 'post';

            return axiosInstance[method](apiUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success" && !isEditMode) {
                // form.reset();                
            }
            status === "success" ? toast.success(message) : toast.error(message);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : error),
    });


    async function onSubmit(values: FormValues) {
        try {


            // Create a payload object for JSON
            const payload: Record<string, any> = {
                productName: values.productName,
                brandId: values.brandId,
                categoryId: values.categoryId,
                productDescription: values.productDescription || '',
                productUses: values.productUses,
                productComposition: values.productComposition,
                productDirections: values.productDirections,
                productSideEffects: values.productSideEffects,
                productAdditionalInfo: values.productAdditionalInfo,
                productRouteOfAdministration: values.productRouteOfAdministration,
                productMedActivity: values.productMedActivity,
                productPrecaution: values.productPrecaution,
                productInteractions: values.productInteractions,
                productDosageInformation: values.productDosageInformation,
                productStorage: values.productStorage,
                productDietAndLifestyleGuidance: values.productDietAndLifestyleGuidance,
                productHighlights: values.productHighlights,
                productIngredients: values.productIngredients,
                productKeyUses: values.productKeyUses,
                productHowToUse: values.productHowToUse,
                productSafetyInformation: values.productSafetyInformation,
                hasAlternativeProduct: values.hasAlternativeProduct,
                productVariations: values.productVariations || [],
                productAlternatives: values.hasAlternativeProduct
                    ? {
                        productAlternativeName: values.productAlternatives.productAlternativeName,
                        productAlternativeCompanyName: values.productAlternatives.productAlternativeCompanyName,
                        productAlternativeContent: values.productAlternatives.productAlternativeContent,
                        productAlternativePrice: values.productAlternatives.productAlternativePrice,
                        productAlternativeDiscount: values.productAlternatives.productAlternativeDiscount,
                        productAlternativeDiscountType: values.productAlternatives.productAlternativeDiscountType,
                        productAlternativeUnits: values.productAlternatives.productAlternativeUnits,
                    }
                    : {},
            };

            // If files are present, add Base64 strings (optional)
            if (values.productImages && values.productImages.length > 0) {
                payload.productImages = await Promise.all(
                    values.productImages.map(async (file) => {
                        const base64 = await fileToBase64(file);
                        return base64;
                    })
                );
            }

            if (values.hasAlternativeProduct && values.productAlternativeImage) {
                payload.productAlternativeImage = await fileToBase64(values.productAlternativeImage);
            }

            productMutation.mutate(payload);
            // console.log(payload);

        } catch (error) {
            toast.error('Error: ' + (error instanceof Error ? error.message : error));
        }
    }


    // alternative product handling
    const [hasAlternativeProduct, setHasAlternativeProduct] = useState(false);

    const handleAlternativeProductChange = (value: boolean) => {
        form.setValue('hasAlternativeProduct', value);
        setHasAlternativeProduct(value);
    }

    // discount type data
    const discountTypeData = [
        {
            label: "Percentage",
            value: "percentage"
        },
        {
            label: "Fixed",
            value: "fixed"
        }
    ]


    // variations Handling
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
    const [currentVariation, setCurrentVariation] = useState<ProductVariation>({
        id: '',
        name: '',
        price: 0,
        discount: 0,
        discountType: 'percentage',
        units: 0,
        stock: 0
    })
    const [isEditingVariation, setIsEditingVariation] = useState(false)

    const handleVariationChange = (field: keyof ProductVariation, value: string | number) => {
        setCurrentVariation(prev => ({ ...prev, [field]: value }));
    }

    const validateVariation = () => {
        try {
            productVariationSchema.parse(currentVariation);
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(err => {
                    toast.error(err.message);
                });
            }
            return false;
        }
    }

    const handleUpdateVariation = useCallback(() => {
        if (!validateVariation()) return;

        const variations = form.getValues('productVariations') || [];
        form.setValue('productVariations', variations.map(v =>
            v.id === currentVariation.id ? currentVariation : v
        ), { shouldValidate: true });

        setCurrentVariation({
            id: '',
            name: '',
            price: 0,
            discount: 0,
            discountType: 'percentage',
            units: 0,
            stock: 0
        });
        setIsEditingVariation(false);
        setIsVariantDialogOpen(false);
    }, [currentVariation, form]);

    const handleAddVariation = useCallback(() => {
        if (!validateVariation()) return;

        const variations = form.getValues('productVariations') || [];
        const newVariation = {
            ...currentVariation,
            id: Date.now().toString() // Generate unique ID
        };

        form.setValue('productVariations', [...variations, newVariation], { shouldValidate: true });

        setCurrentVariation({
            id: '',
            name: '',
            price: 0,
            discount: 0,
            discountType: 'percentage',
            units: 0,
            stock: 0
        });
        setIsVariantDialogOpen(false);
    }, [currentVariation, form]);

    const handleEditVariation = (variation: ProductVariation) => {
        setCurrentVariation(variation);
        setIsEditingVariation(true);
        setIsVariantDialogOpen(true);
    }

    const handleRemoveVariation = (id: string) => {
        const variations = form.getValues('productVariations') || [];
        const updatedVariations = variations.filter(v => v.id !== id);
        form.setValue('productVariations', updatedVariations, { shouldValidate: true });
    }


    // edit mode 

    const { id } = useParams();


    const { data: productData, refetch: fetchProductData } = useQuery({
        queryKey: ['product', id],
        queryFn: () => axiosInstance.get(`${PRODUCT_API}/${id}`),
        enabled: false // Prevent auto-fetching
    });


    useEffect(() => {
        if (id && isEditMode) {
            fetchProductData();
        }
    }, [id, isEditMode, fetchProductData]);


    const [isImagesLoading, setIsImagesLoading] = useState(isEditMode);

    useEffect(() => {


        const loadImagesAsFiles = async (imageUrls: string[]) => {
            try {
                setIsImagesLoading(true);
                const filePromises = imageUrls.map(async (url, index) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    return new File([blob], `image_${index + 1}.png`, { type: blob.type });
                });
                const files = await Promise.all(filePromises);
                setIsImagesLoading(false);
                return files;
            } catch (error) {
                console.error("Error converting images to File objects:", error);
                setIsImagesLoading(false);
                return [];
            }
        };

        if (productData?.data) {
            const { productDetails, alternativeDetails, variationsDetails } = productData.data.data;

            const loadFormData = async () => {
                const productImages = await loadImagesAsFiles(productDetails.images || []);
                const productAlternativeImage = alternativeDetails?.imageUrl
                    ? await loadImagesAsFiles([alternativeDetails.imageUrl])
                    : null;

                const formValues = {
                    productName: productDetails.name || "",
                    productDescription: productDetails.description || "",
                    brandId: productDetails.brandId || "",
                    categoryId: productDetails.categoryId || "",
                    productUses: productDetails.uses || "",
                    productComposition: productDetails.composition || "",
                    productDirections: productDetails.direction || "",
                    productSideEffects: productDetails.sideEffects || "",
                    productAdditionalInfo: productDetails.additionalInfo || "",
                    productRouteOfAdministration: productDetails.routeOfAdministration || "",
                    productMedActivity: productDetails.medActivity || "",
                    productPrecaution: productDetails.precaution || "",
                    productInteractions: productDetails.interactions || "",
                    productDosageInformation: productDetails.dosageInformation || "",
                    productStorage: productDetails.storage || "",
                    productDietAndLifestyleGuidance: productDetails.dietAndLifestyleGuidance || "",
                    productHighlights: productDetails.highlights || "",
                    productIngredients: productDetails.ingredients || "",
                    productKeyUses: productDetails.keyUses || "",
                    productHowToUse: productDetails.howToUse || "",
                    productSafetyInformation: productDetails.safetyInformation || "",
                    productVariations: variationsDetails?.map((variation: ProductVariation) => ({
                        id: variation.id,
                        name: variation.name,
                        price: variation.price,
                        discount: variation.discount,
                        discountType: variation.discountType,
                        units: variation.units,
                        stock: variation.stock,
                    })) || [],
                    productImages: productImages,
                    hasAlternativeProduct: !!alternativeDetails,
                    productAlternativeImage: productAlternativeImage ? productAlternativeImage[0] : null,
                    productAlternatives: {
                        productAlternativeName: alternativeDetails?.productName || "",
                        productAlternativeCompanyName: alternativeDetails?.companyName || "",
                        productAlternativeContent: alternativeDetails?.productContent || "",
                        productAlternativePrice: alternativeDetails?.price || 0,
                        productAlternativeDiscount: alternativeDetails?.discount || 0,
                        productAlternativeDiscountType: alternativeDetails?.discountType || "percentage",
                        productAlternativeUnits: alternativeDetails?.units || 0,
                    },
                };


                // Reset the form with the fetched data
                form.reset(formValues);
            };

            loadFormData();
        }
    }, [productData, form]);


    // Utility function to convert file to Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const getDropdownData = async (apiUrl: string) => {
        const response = await axiosInstance.get(apiUrl);
        return response.data.data.map((item: any) => {
            return {
                label: item.name,
                value: item.id
            };
        });
    }


    const handleNewItemClick = (label: string) => {
        // navigate(`/${}s/upload?ref=product`);

        const path = getNavigationPath(label.toLowerCase());
        navigate(path);

    }

    const getNavigationPath = (label: string) => {
        switch (label) {
            case 'brand':
                return '/admin/companies/upload?ref=product';
            case 'category':
                return '/admin/categories/upload?ref=product';
            default:
                return '/admin/products/upload';
        }
    }

    const productDetailsMutation = useMutation({
        mutationFn: (payload: Record<string, any>) => {
            return axiosInstance.post(`${PRODUCT_API}/scrape`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

        },
        onSuccess: (response) => {
            try {

                const { data, message, status } = response.data;
                if (status === "success") {
                    toast.success("Product details loaded successfully");

                    // set the form values
                    // form.setValue('productComposition', data.composition);

                    if (data.description) {
                        form.setValue('productDescription', data.description);
                    }

                    if (data.additionalInformation?.length > 0) {
                        const additionalInformation = data.additionalInformation
                            .map((info: string) => `<li>${info}</li>`)
                            .join('');

                        form.setValue('productAdditionalInfo', `<ul>${additionalInformation}</ul>`);
                    } else {
                        form.setValue('productAdditionalInfo', '');
                    }

                    if (data.ingredients?.length > 0) {
                        const ingredients = data.ingredients
                            .map((ingredient: string) => `<li>${ingredient}</li>`)
                            .join('');

                        form.setValue('productIngredients', `<ul>${ingredients}</ul>`);
                    } else {
                        form.setValue('productIngredients', '');
                    }

                    if (data.composition) {
                        form.setValue('productComposition', data.composition);
                    }

                    if (data.uses) {
                        form.setValue('productUses', data.uses);
                    }

                    if (data.direction) {
                        form.setValue('productDirections', data.direction);
                    }

                    if (data.routeOfAdministration) {
                        form.setValue('productRouteOfAdministration', data.routeOfAdministration);
                    }

                    if (data.sideEffects?.length > 0) {
                        form.setValue('productSideEffects', data.sideEffects);
                    }

                    if (data.medActivity) {
                        form.setValue('productMedActivity', data.medActivity);
                    }

                    if (data.precaution?.length > 0) {
                        const precaution = data.precaution
                            .map((step: string) => `<li>${step}</li>`)
                            .join('');

                        form.setValue('productPrecaution', `<ul>${precaution}</ul>`);
                    } else {
                        form.setValue('productPrecaution', '');
                    }

                    if (data.interactions?.length > 0) {
                        const interactions = data.interactions
                            .map((interaction: string) => `<li>${interaction}</li>`)
                            .join('');

                        form.setValue('productInteractions', `<ul>${interactions}</ul>`);
                    } else {
                        form.setValue('productInteractions', '');
                    }

                    if (data.dosageInformation?.length > 0) {
                        const dosageInformation = data.dosageInformation
                            .map((step: string) => `<li>${step}</li>`)
                            .join('');

                        form.setValue('productDosageInformation', `<ul>${dosageInformation}</ul>`);
                    } else {
                        form.setValue('productDosageInformation', '');
                    }

                    if (data.storage) {
                        form.setValue('productStorage', data.storage);
                    }

                    if (data.dietAndLifestyleGuidance) {
                        form.setValue('productDietAndLifestyleGuidance', data.dietAndLifestyleGuidance);
                    }

                    if (data.highlights?.length > 0) {
                        const highlights = data.highlights
                            .map((highlight: string) => `<li>${highlight}</li>`)
                            .join('');

                        form.setValue('productHighlights', `<ul>${highlights}</ul>`);
                    } else {
                        form.setValue('productHighlights', '');
                    }


                    if (data.keyUses?.length > 0) {
                        const keyUses = data.keyUses
                            .map((use: string) => `<li>${use}</li>`)
                            .join('');

                        form.setValue('productKeyUses', `<ul>${keyUses}</ul>`);
                    } else {
                        form.setValue('productKeyUses', '');
                    }

                    if (data.howToUse?.length > 0) {
                        const howToUse = data.howToUse
                            .map((step: string) => `<li>${step}</li>`)
                            .join('');

                        form.setValue('productHowToUse', `<ul>${howToUse}</ul>`);
                    } else {
                        form.setValue('productHowToUse', '');
                    }

                    if (data.safetyInformation) {
                        form.setValue('productSafetyInformation', data.safetyInformation);
                    }


                } else {
                    toast.error(message);
                }
            } catch (error) {
                toast.error("Something went wrong");
            }
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : error),
    });

    const loadProductDetails = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (form.getValues('productName')) {
            // reset the details and not whole form
            form.setValue('productDescription', '');
            form.setValue('productComposition', '');
            form.setValue('productUses', '');
            form.setValue('productDirections', '');
            form.setValue('productSideEffects', '');
            form.setValue('productAdditionalInfo', '');
            form.setValue('productPrecaution', '');
            form.setValue('productInteractions', '');
            form.setValue('productDosageInformation', '');
            form.setValue('productStorage', '');
            form.setValue('productDietAndLifestyleGuidance', '');
            form.setValue('productHighlights', '');
            form.setValue('productKeyUses', '');
            form.setValue('productHowToUse', '');
            form.setValue('productSafetyInformation', '');
            form.setValue('productIngredients', '');
            form.setValue('productMedActivity', '');


            productDetailsMutation.mutate({ medicineName: form.getValues('productName') });
        } else {
            toast.error('Please enter a product name before loading details');
        }
    }

    // const handleRichTextEditorChange = (...params: any) => {
    //     console.log(params);
    // }




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
            {
                (isEditMode && isImagesLoading) && <PageLoader />
            }

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full p-4">

                    <div className='w-full flex flex-col lg:flex-row gap-4'>

                        <div className='w-full lg:w-[65%] flex flex-col gap-4'>


                            <Card className='w-full h-fit'>
                                <CardHeader className='p-[0.75rem]'>
                                    <CardTitle>
                                        Product Main Details
                                    </CardTitle>
                                    <CardContent className='p-0'>

                                    </CardContent>
                                    <div className='w-full flex justify-end pb-4'>
                                        <Button disabled={productDetailsMutation.isPending} className={`bg-blue-500 text-white dark:bg-blue-600 dark:hover:bg-blue-700 ${productDetailsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={loadProductDetails}>
                                            {
                                                productDetailsMutation.isPending ? <>
                                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                    loading...
                                                </> : <>Load Product Details</>
                                            }
                                        </Button>
                                    </div>

                                    <div className='w-full grid grid-cols-3 gap-4'>

                                        {/* Product Name Field */}
                                        <FormField
                                            control={form.control}
                                            name="productName"
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
                                            name="brandId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{formSingular} Brand</FormLabel>
                                                    <FormControl>
                                                        <SelectWithSearch data={brandData || []} label="Brand" {...field} newItemClick={handleNewItemClick} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{formSingular} Category</FormLabel>
                                                    <FormControl>
                                                        <SelectWithSearch data={categoryData || []} label="Category" {...field} newItemClick={handleNewItemClick} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Product Description Field */}
                                        <FormField
                                            control={form.control}
                                            name="productDescription"
                                            render={({ field }) => (
                                                <FormItem
                                                    className="col-span-3"
                                                >
                                                    <FormLabel>{formSingular} Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Enter ${formSingular} Description`}
                                                            className="min-h-[100px]"
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="productComposition"
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormLabel>{formSingular} Composition</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Enter ${formSingular} Composition`}
                                                            {...field}
                                                            className="min-h-[100px]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(productDetailsMutation?.data?.data?.data || isEditMode) && (
                                            <>


                                                {form.getValues('productUses') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productUses"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Uses</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productDirections') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productDirections"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Directions</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productRouteOfAdministration') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productRouteOfAdministration"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Route Of Administration</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {/* {productDetailsMutation?.data?.data.data.sideEffects && ( */}
                                                {form.getValues('productSideEffects') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productSideEffects"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Side Effects</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productMedActivity') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productMedActivity"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Medical Activity</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productPrecaution') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productPrecaution"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Precaution</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productInteractions') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productInteractions"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Interactions</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productDosageInformation') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productDosageInformation"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Dosage Information</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productStorage') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productStorage"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Storage</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productDietAndLifestyleGuidance') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productDietAndLifestyleGuidance"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Diet And Lifestyle Guidance</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productHighlights') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productHighlights"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Highlights</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productIngredients') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productIngredients"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem className="col-span-3">
                                                                    <FormLabel>{formSingular} Ingredients</FormLabel>
                                                                    <FormControl>
                                                                        <RichTextEditor
                                                                            value={field.value}
                                                                            onChange={(value: string) => field.onChange(value)}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                )}

                                                {form.getValues('productKeyUses') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productKeyUses"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Key Uses</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productHowToUse') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productHowToUse"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} How To Use</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {form.getValues('productSafetyInformation') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="productSafetyInformation"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-3">
                                                                <FormLabel>{formSingular} Safety Information</FormLabel>
                                                                <FormControl>
                                                                    <RichTextEditor
                                                                        value={field.value}
                                                                        onChange={(value: string) => field.onChange(value)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {
                                                    form.getValues('productAdditionalInfo') && (
                                                        <FormField
                                                            control={form.control}
                                                            name="productAdditionalInfo"
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-3">
                                                                    <FormLabel>{formSingular} Additional Information</FormLabel>
                                                                    <FormControl>
                                                                        <RichTextEditor
                                                                            value={field.value}
                                                                            onChange={(value: string) => field.onChange(value)}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}


                                            </>
                                        )}



                                        {/* <FormField
                                            control={form.control}
                                            name="productAdditionalInfo"
                                            render={({ field }) => (
                                                <FormItem
                                                    className="col-span-3"
                                                >
                                                    <FormLabel>{formSingular} Additional Info</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Enter ${formSingular} Additional Info`}
                                                            className="min-h-[100px]"
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                    </div>

                                </CardHeader>
                            </Card>

                            <Card className='w-full h-fit'>
                                <CardHeader className='p-[0.75rem]'>
                                    <CardTitle>
                                        {formSingular} Variations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-0 pt-4 pb-10'>

                                    <div className='w-full px-4'>


                                        <div className='w-full flex justify-end'>

                                            <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button onClick={() => {
                                                        setIsEditingVariation(false)
                                                        setCurrentVariation({
                                                            id: '',
                                                            name: '',
                                                            price: 0,
                                                            discount: 0,
                                                            discountType: 'percentage',
                                                            units: 0,
                                                            stock: 0
                                                        })
                                                    }}>
                                                        <Plus className="mr-2 h-4 w-4" /> Add Variation
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{isEditingVariation ? 'Edit' : 'Add'} Product Variation</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor="variation-name">Name</Label>
                                                                <Input
                                                                    id="variation-name"
                                                                    value={currentVariation.name}
                                                                    onChange={(e) => handleVariationChange('name', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="variation-price">Price</Label>
                                                                <Input
                                                                    id="variation-price"
                                                                    type="number"
                                                                    value={currentVariation.price}
                                                                    onChange={(e) => handleVariationChange('price', Number(e.target.value))}
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor="variation-discount">Discount</Label>
                                                                <Input
                                                                    id="variation-discount"
                                                                    type="number"
                                                                    value={currentVariation.discount}
                                                                    onChange={(e) => handleVariationChange('discount', Number(e.target.value))}
                                                                    min="0"
                                                                    step="0.01"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Discount Type</Label>
                                                                <RadioGroup
                                                                    value={currentVariation.discountType}
                                                                    onValueChange={(value: DiscountType) => handleVariationChange('discountType', value)}
                                                                    required
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="percentage" id="variation-percentage" />
                                                                        <Label htmlFor="variation-percentage">Percentage</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="fixed" id="variation-fixed" />
                                                                        <Label htmlFor="variation-fixed">Fixed Amount</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor="variation-units">Units</Label>
                                                                <Input
                                                                    id="variation-units"
                                                                    type="number"
                                                                    value={currentVariation.units}
                                                                    onChange={(e) => handleVariationChange('units', Number(e.target.value))}
                                                                    min="1"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="variation-stock">Stock</Label>
                                                                <Input
                                                                    id="variation-stock"
                                                                    type="number"
                                                                    value={currentVariation.stock}
                                                                    onChange={(e) => handleVariationChange('stock', Number(e.target.value))}
                                                                    min="0"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button onClick={isEditingVariation ? handleUpdateVariation : handleAddVariation}>
                                                        {isEditingVariation ? 'Update' : 'Add'} Variation
                                                    </Button>
                                                </DialogContent>
                                            </Dialog>

                                        </div>

                                        <ScrollArea className="h-[400px] pt-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {form.watch("productVariations")?.map((variation) => (
                                                    <Card key={variation.id}>
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h3 className="text-lg font-semibold">{variation.name}</h3>
                                                                <div>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => handleEditVariation(variation)}
                                                                                    className="mr-2"
                                                                                >
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Edit variation</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="icon"
                                                                                    onClick={() => handleRemoveVariation(variation.id)}
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Remove variation</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            </div>
                                                            <p>Price: ₹ {variation.price}</p>
                                                            <p>Discount: {variation.discount} ({variation.discountType})</p>
                                                            <p>Units: {variation.units}</p>
                                                            <p>Stock: {variation.stock}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </ScrollArea>

                                        {form.formState.errors.productVariations && (
                                            <Alert variant="destructive" className="mt-4">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Validation Error</AlertTitle>
                                                <AlertDescription>
                                                    {form.formState.errors.productVariations.message}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                    </div>

                                </CardContent>
                            </Card>

                        </div>

                        <div className='w-full lg:w-[35%] flex flex-col gap-4'>

                            <Card className='w-full h-fit'>
                                <CardHeader className='p-[0.75rem]'>
                                    <CardTitle className={`${form.formState.errors.productImages ? "text-red-500" : ""}`}>
                                        {formSingular} Images
                                    </CardTitle>

                                    <CardContent className='p-0 pt-4'>
                                        {/* eslint-disable-next-line no-unused-vars */}
                                        <FormField
                                            control={form.control}
                                            name="productImages"
                                            render={() => (
                                                <FormItem>
                                                    <FormControl>
                                                        <FileUpload
                                                            name="productImages"
                                                            control={form.control}
                                                            multiple={true}
                                                            isWidthFull={true}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />


                                    </CardContent>
                                </CardHeader>
                            </Card>


                            <Card className='w-full h-fit'>
                                <CardHeader className='p-[0.75rem]'>
                                    <CardTitle>
                                        Branded Alternative
                                    </CardTitle>

                                    <CardContent className='p-0 pt-4'>
                                        <div className='flex items-center gap-2'>
                                            <Switch id="has-alternative-product" checked={hasAlternativeProduct} onCheckedChange={handleAlternativeProductChange} />
                                            <Label htmlFor="has-alternative-product">Has Branded Alternative</Label>
                                        </div>
                                        <div className='w-full grid grid-cols-2 gap-4 pt-4'>

                                            {hasAlternativeProduct && (
                                                <>

                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Name</FormLabel>
                                                                <FormControl>
                                                                    <Input type="text" placeholder="Enter Alternative Name" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeCompanyName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Company Name</FormLabel>
                                                                <FormControl>
                                                                    <Input type="text" placeholder="Enter Alternative Company Name" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativePrice"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Price</FormLabel>
                                                                <FormControl>
                                                                    <PriceInput  {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeDiscount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Discount</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Enter Alternative Discount"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                        value={field.value || 0}
                                                                        min={0}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeUnits"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Units</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Enter Alternative Units"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                        value={field.value || 0}
                                                                        min={0}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeDiscountType"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternative Discount Type</FormLabel>
                                                                <FormControl>
                                                                    <SelectWithSearch data={discountTypeData || []} label="Discount Type" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternatives.productAlternativeContent"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-2">
                                                                <FormLabel>Alternative Content</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Enter Alternative Content" className="min-h-[100px]" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {/* eslint-disable-next-line no-unused-vars */}
                                                    <FormField
                                                        control={form.control}
                                                        name="productAlternativeImage"
                                                        render={() => (
                                                            <FormItem className='col-span-2'>
                                                                <FormLabel>Alternative Image</FormLabel>
                                                                <FormControl>
                                                                    <FileUpload
                                                                        name="productAlternativeImage"
                                                                        control={form.control}
                                                                        multiple={false}
                                                                        maxFiles={1}
                                                                        isWidthFull={true}
                                                                        onFileChange={(files) => {
                                                                            form.setValue("productAlternativeImage", files[0], { shouldValidate: true });
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />


                                                </>
                                            )}

                                        </div>
                                    </CardContent>
                                </CardHeader>
                            </Card>


                        </div>

                    </div>

                    <Button type="submit" className='my-8' disabled={productMutation.isPending}>
                        {productMutation.isPending ? (
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
