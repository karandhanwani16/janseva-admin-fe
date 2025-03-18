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
    FormMessage,
} from "@/components/ui/form"

import FileUpload from "../Fileupload/FileUpload"

import { useMutation, useQuery } from '@tanstack/react-query'

import axiosInstance from '@/utils/API'

import { ArrowLeft, Loader } from 'lucide-react'

import { useTheme } from '@/store/useTheme'

import { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { Card, CardTitle, CardHeader, CardContent } from '../ui/card'

import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

import { PRODUCT_API } from '../../utils/API-ROUTES'
import PageLoader from '../PageLoader'

import {
    FormValues, ProductFormProps,
    ProductVariationEdit
} from './types'
import ProductMainDetails from './ProductMainDetails'
import ProductVariationComponent from './ProductVariationComponent'
import { productVariationSchema } from './common'
import BrandedAlternativeComponent from './BrandedAlternativeComponent'


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
    productSlug: z.string(),
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

    // form handling
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            productSlug: "",
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

            const apiUrl = isEditMode ? `${PRODUCT_API}/${slug}` : PRODUCT_API;
            const method = isEditMode ? 'put' : 'post';

            // Calculate discount percentage for each variation before sending
            const variations = payload.productVariations.map((variation: any) => {
                const discountPercentage = ((variation.price - variation.discountedPrice) / variation.price) * 100;
                return {
                    ...variation,
                    discount: discountPercentage,
                    discountType: 'percentage'
                };
            });

            return axiosInstance[method](apiUrl, {
                ...payload,
                productVariations: variations
            }, {
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
                productSlug: values.productSlug,
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
    // edit mode 
    const { slug } = useParams();

    const { data: productData, refetch: fetchProductData } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => axiosInstance.get(`${PRODUCT_API}/${slug}`),
        enabled: false // Prevent auto-fetching
    });
    useEffect(() => {
        if (slug && isEditMode) {
            fetchProductData();
        }
    }, [slug, isEditMode, fetchProductData]);


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

        if (productData?.data.data) {

            const { productDetails, alternativeDetails, variationsDetails } = productData.data.data;

            const loadFormData = async () => {
                const productImages = await loadImagesAsFiles(productDetails.images || []);
                const productAlternativeImage = alternativeDetails?.imageUrl
                    ? await loadImagesAsFiles([alternativeDetails.imageUrl])
                    : null;

                const formValues = {
                    productName: productDetails.name || "",
                    productSlug: productDetails.slug || "",
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
                    productVariations: variationsDetails?.map((variation: ProductVariationEdit) => ({
                        id: variation.id,
                        name: variation.name,
                        price: variation.price,
                        discountedPrice: variation.price - (variation.price * variation.discount / 100),
                        discountType: 'percentage',
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
        } else {
            setIsImagesLoading(false);
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


                                        <ProductMainDetails form={form} formSingular={formSingular} isEditMode={isEditMode} />

                                    </CardContent>
                                </CardHeader>
                            </Card>

                            <Card className='w-full h-fit'>
                                <CardHeader className='p-[0.75rem]'>
                                    <CardTitle>
                                        {formSingular} Variations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-0 pt-4 pb-10'>
                                    <ProductVariationComponent form={form} />
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

                                            {hasAlternativeProduct && <BrandedAlternativeComponent form={form} />}

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
