import { Button } from "@/components/ui/button"
import axiosInstance from "@/utils/API";
import { BRAND_API, CATEGORY_API, PRODUCT_API } from "@/utils/API-ROUTES";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react"
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"
import {  FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import RichTextEditor from '../RichTextEditor'
import SelectWithSearch from "../SelectWithSearch";


function ProductMainDetails({ form, formSingular, isEditMode }: { form: any, formSingular: string, isEditMode: boolean }) {

    const navigate = useNavigate();

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
    const getDropdownData = async (apiUrl: string) => {
        const response = await axiosInstance.get(apiUrl);
        return response.data.data.map((item: any) => {
            return {
                label: item.name,
                value: item.id
            };
        });
    }

    const { data: brandData } = useQuery({
        queryKey: ['form-brand'],
        queryFn: () => getDropdownData(BRAND_API)
    });

    const { data: categoryData } = useQuery({
        queryKey: ['form-category'],
        queryFn: () => getDropdownData(CATEGORY_API)
    });
    const handleNewItemClick = (label: string) => {
        // navigate(`/${}s/upload?ref=product`);

        const path = getNavigationPath(label.toLowerCase());
        navigate(path);
    }

    const loadProductDetails = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (form.getValues('productName')) {
            form.setValue('productSlug', '');
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


    const productDetailsMutation = useMutation({
        mutationFn: (payload: Record<string, any>) => {
            return axiosInstance.post(`${PRODUCT_API}/scrape`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

        },
        onSuccess: (response) => {
            try {

                console.log(response.data);

                const { data, message, status } = response.data;
                if (status === "success") {
                    toast.success("Product details loaded successfully");



                    // set the form values
                    // form.setValue('productComposition', data.composition);

                    if (data.description) {
                        form.setValue('productDescription', data.description);
                    }

                    console.log(data.slug);


                    if (data.slug) {
                        form.setValue('productSlug', data.slug);
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



    return (
        <>
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
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        // Generate slug from product name
                                        const slug = e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/(^-|-$)/g, '');
                                        form.setValue('productSlug', slug);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productSlug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{formSingular} Slug</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={`Enter ${formSingular} Slug`}
                                    type="text"
                                    disabled
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

            </div>
        </>
    )
}

export default ProductMainDetails
