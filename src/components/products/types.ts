export type DiscountType = 'percentage' | 'fixed'

export interface FormValues {
    productName: string;
    productSlug: string;
    productDescription?: string;
    brandId: string;
    categoryId: string;
    productUses: string;
    productComposition: string;
    productDirections: string;
    productSideEffects: string;
    productAdditionalInfo: string;
    productRouteOfAdministration: string;
    productMedActivity: string;
    productPrecaution: string;
    productInteractions: string;
    productDosageInformation: string;
    productStorage: string;
    productDietAndLifestyleGuidance: string;
    productHighlights: string;
    productIngredients: string;
    productKeyUses: string;
    productHowToUse: string;
    productSafetyInformation: string;
    productVariations: ProductVariation[];
    productImages: File[] | null;
    hasAlternativeProduct: boolean;
    productAlternatives: ProductAlternative;
    productAlternativeImage: File | null;
}


export interface ProductVariation {
    id: string;
    name: string;
    price: number;
    discount: number;
    discountType: string;
    stock: number;
    units: number;
}

interface ProductAlternative {
    productAlternativeName: string;
    productAlternativeCompanyName: string;
    productAlternativeContent: string;
    productAlternativePrice: number;
    productAlternativeDiscount: number;
    productAlternativeDiscountType: string;
    productAlternativeUnits: number;
}

export interface ProductFormProps {
    isEditMode?: boolean;
}
