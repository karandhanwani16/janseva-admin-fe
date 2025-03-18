import FileUpload from "../Fileupload/FileUpload";
import SelectWithSearch from "../SelectWithSearch";
import { FormField } from "../ui/form";
import { FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import PriceInput from "../ui/price-input";
import { Textarea } from "../ui/textarea";

function BrandedAlternativeComponent({ form }: { form: any }) {
    // discount type data
    const discountTypeData = [
        {
            label: "Percentage",
            value: "percentage"
        }
    ]


    return (
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
    )
}

export default BrandedAlternativeComponent
