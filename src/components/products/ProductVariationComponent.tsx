import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Plus, Pencil, X } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip'
import { ProductVariation } from './types'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { productVariationSchema } from './common'
import { z } from 'zod'

// function ProductVariationComponent({ form, formSingular, isEditMode }: { form: any, formSingular: string, isEditMode: boolean }) {
function ProductVariationComponent({ form }: { form: any }) {

    // variations Handling
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
    const [currentVariation, setCurrentVariation] = useState<ProductVariation>({
        id: '',
        name: '',
        price: 0,
        discountedPrice: 0,
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
        form.setValue('productVariations', variations.map((v: ProductVariation) =>
            v.id === currentVariation.id ? currentVariation : v
        ), { shouldValidate: true });

        setCurrentVariation({
            id: '',
            name: '',
            price: 0,
            discountedPrice: 0,
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
            discountedPrice: 0,
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
        const updatedVariations = variations.filter((v: ProductVariation) => v.id !== id);
        form.setValue('productVariations', updatedVariations, { shouldValidate: true });
    }

    const calculateDiscountPercentage = (price: number, discountedPrice: number) => {
        if (price === 0) return 0;
        const percentage = ((price - discountedPrice) / price * 100);
        return Number(Math.min(percentage, 100).toFixed(2));
    }

    return (
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
                                discountedPrice: 0,
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
                                    <Label htmlFor="variation-discounted-price">Discounted Price</Label>
                                    <Input
                                        id="variation-discounted-price"
                                        type="number"
                                        value={currentVariation.discountedPrice}
                                        onChange={(e) => handleVariationChange('discountedPrice', Number(e.target.value))}
                                        min="0"
                                        max={currentVariation.price}
                                        step="0.01"
                                        required
                                    />
                                </div>
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
                        <Button onClick={isEditingVariation ? handleUpdateVariation : handleAddVariation}>
                            {isEditingVariation ? 'Update' : 'Add'} Variation
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="h-[400px] pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {form.watch("productVariations")?.map((variation: ProductVariation) => (
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
                                <p>Discounted Price: ₹ {variation.discountedPrice}</p>
                                <p>Discount: {calculateDiscountPercentage(variation.price, variation.discountedPrice)}%</p>
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
    )
}

export default ProductVariationComponent
