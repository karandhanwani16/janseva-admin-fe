import { useTheme } from "@/store/useTheme"
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../ui/button"
import { Product } from "../products/types"
import { ProductModal } from "../ProductModal"
import EmptyState from "../ui/EmptyState"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { PRESCRIPTION_ORDER_API, PRESCRIPTION_STATUS_API, PRODUCT_API } from "@/utils/API-ROUTES"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { AdminPrescriptionPreview } from "./AdminPrescriptionPreview"
import { CheckCircleIcon, Loader2, Minus, Plus, XCircleIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { PrescriptionStatus } from "./types"
import { Input } from "../ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import BackButton from "../ui/BackButton"

function SinglePrescriptionView() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [addedProducts, setAddedProducts] = useState<{ product: Product, selectedVariationId?: string, quantity: number }[]>([])
    const [isPrescriptionOrder, setIsPrescriptionOrder] = useState(false)
    const [isPrescriptionOrdered, setIsPrescriptionOrdered] = useState(false)
    const [isPrescriptionRejected, setIsPrescriptionRejected] = useState(false)
    const [prescriptionRejectionReason, setPrescriptionRejectionReason] = useState('');
    const [products, setProducts] = useState<Product[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { isDarkMode } = useTheme()
    const navigate = useNavigate()
    const { id } = useParams()

    const getPrescription = async (id: string) => {
        if (!id) return
        const response = await axiosInstance.get(`${PRESCRIPTION_STATUS_API}/${id}`)
        return response.data.data
    }

    const { data: prescriptionData, isLoading: isPrescriptionLoading, refetch: refetchPrescription } = useQuery({
        queryKey: ['prescription-status', id],
        queryFn: () => getPrescription(id || '')
    })

    const createPrescriptionOrder = useMutation({
        mutationFn: async (data: { status: PrescriptionStatus, rejectionReason?: string }) => {
            const response = await axiosInstance.post(`${PRESCRIPTION_STATUS_API}/${id}`, data)
            return response
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            status === "success" ? toast.success(message) : toast.error(message);
            refetchPrescription(); // Refetch prescription data after successful mutation
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : error),
    })

    const submitOrder = useMutation({
        mutationFn: async (orderData: { product_id: string, variant_id: string, quantity: number }[]) => {
            const response = await axiosInstance.post(`${PRESCRIPTION_ORDER_API}/${id}`, { products: orderData })
            return response.data
        },
        onSuccess: () => {
            toast.success("Order submitted successfully")
            navigate(-1)
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to submit order")
    })

    useEffect(() => {
        if (prescriptionData?.status === 'ORDERED') {
            setIsPrescriptionOrdered(true);
        } else if (prescriptionData?.status === 'REJECTED') {
            setIsPrescriptionRejected(true);
            setPrescriptionRejectionReason(prescriptionData.data.rejectionReason);
        }

        if (prescriptionData?.status && prescriptionData.status !== 'UPLOADED') {
            setIsPrescriptionOrder(true);
        }
    }, [id, prescriptionData])

    const addProduct = (product: Product, selectedVariationId?: string) => {
        setAddedProducts((prev) => [...prev, { product, selectedVariationId, quantity: 1 }])
    }

    const removeProduct = (product: Product) => {
        setAddedProducts((prev) => prev.filter((p) => p.product.id !== product.id))
    }

    const updateVariation = (productId: string, variationId: string) => {
        setAddedProducts((prev) => prev.map(item =>
            item.product.id === productId
                ? { ...item, selectedVariationId: variationId }
                : item
        ))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        setAddedProducts((prev) => prev.map(item =>
            item.product.id === productId
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
        ))
    }

    const finalizeOrder = () => {
        setIsConfirmDialogOpen(true)
    }

    const confirmOrder = () => {
        const orderData = addedProducts.map(({ product, selectedVariationId, quantity }) => ({
            product_id: product.id,
            variant_id: selectedVariationId || product.productVariationsList?.[0]?.id || '',
            quantity
        }))
        submitOrder.mutate(orderData)
        setIsConfirmDialogOpen(false)
    }

    const getProducts = async () => {
        const response = await axiosInstance.get(`${PRODUCT_API}?page=${page}&limit=2${searchTerm ? `&search=${searchTerm}` : ''}`);
        const fetchedProducts = response.data.data.data;
        setTotalPages(Math.ceil(response.data.data.total / 2));

        const uniqueProducts = fetchedProducts.filter((product: Product) => !products.some((p: Product) => p.id === product.id));
        setProducts((prevProducts: Product[]) => [...prevProducts, ...uniqueProducts]);

        return fetchedProducts;
    };

    const debouncedSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setPage(1); // Reset page when search term changes
        setProducts([]); // Clear existing products
    }, []);

    const { data: productsData, isLoading: isProductsLoading } = useQuery({
        queryKey: ['products', page, searchTerm],
        queryFn: getProducts,
        enabled: isModalOpen // Only fetch when modal is open
    })

    useEffect(() => {
        if (productsData) {
            // Products are already fetched by the useQuery hook
            return;
        }
        
        const timeoutId = setTimeout(() => {
            if (isModalOpen) {
                getProducts();
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(timeoutId);
    }, [searchTerm, isModalOpen, page, productsData]);

    const handleStatusChange = (status: PrescriptionStatus, rejectionReason?: string) => {
        createPrescriptionOrder.mutate({ status, rejectionReason })
    }

    if (isPrescriptionLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (isPrescriptionOrdered) {
        return <div className="w-full h-[85%] bg-white rounded-md">
            <BackButton />
            <div className="w-full h-full flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mb-5" />
                <h2 className="text-3xl font-semibold mb-2">Prescription Ordered Successfully!</h2>
                <p className="text-md text-gray-500">This prescription has been added to the cart. </p>
            </div>
        </div>
    }
    if (isPrescriptionRejected) {
        return <div className="w-full h-[85%] bg-white rounded-md">
            <BackButton />
            <div className="w-full h-full flex flex-col items-center justify-center">
                <XCircleIcon className="h-16 w-16 text-red-500 mb-5" />
                <h2 className="text-3xl font-semibold mb-2">Prescription Rejected!</h2>
                <p className="text-md text-gray-500 mb-8">This prescription has been rejected. </p>
                <p className="text-xl text-gray-500"><b>Reason:</b> {prescriptionRejectionReason}</p>
            </div>
        </div>
    }

    return (
        <div className={`w-full relative h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}>
            <BackButton />
            {
                isPrescriptionOrder ? (
                    <div className="w-full h-full p-6">

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-full flex justify-end">
                                <Button onClick={() => setIsModalOpen(true)}>Add Products</Button>
                            </div>

                            {addedProducts.length > 0 ? (
                                <div className="w-full">
                                    <h2 className="text-xl font-semibold mb-4">Added Products:</h2>
                                    <ul className="space-y-2">
                                        {addedProducts.map(({ product, selectedVariationId, quantity }) => {
                                            const selectedVariation = product.productVariationsList?.find(v => v.id === selectedVariationId);
                                            return (
                                                <li key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="h-16 w-16 rounded-md object-cover"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{product.name}</span>
                                                            {product.productVariationsList && product.productVariationsList.length > 1 ? (
                                                                <Select
                                                                    value={selectedVariationId}
                                                                    onValueChange={(value) => updateVariation(product.id, value)}
                                                                >
                                                                    <SelectTrigger className="w-[180px] mt-2">
                                                                        <SelectValue placeholder="Select variation" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {product.productVariationsList.map((variation) => (
                                                                            <SelectItem key={variation.id} value={variation.id}>
                                                                                {variation.name} - {variation.units} units - ₹{variation.price}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : selectedVariation && (
                                                                <span className="text-sm text-gray-500">
                                                                    {selectedVariation.name} - {selectedVariation.units} units - ₹{selectedVariation.price}
                                                                </span>
                                                            )}
                                                            <div className="mt-2 flex items-center">
                                                                <label className="text-sm mr-2">Quantity:</label>
                                                                <div className="flex items-center border rounded-md">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="px-2 py-0 h-8"
                                                                        onClick={() => updateQuantity(product.id, quantity - 1)}
                                                                        disabled={quantity <= 1}
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={quantity}
                                                                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                                                        className="w-14 text-center border-0 focus-visible:ring-0"
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="px-2 py-0 h-8"
                                                                        onClick={() => updateQuantity(product.id, quantity + 1)}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeProduct(product)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    <EmptyState />
                                    <Button onClick={() => setIsModalOpen(true)}>Add Your First Product</Button>
                                </>
                            )}

                            <Button
                                onClick={finalizeOrder}
                                disabled={addedProducts.length === 0 || submitOrder.isPending}
                                className="w-full py-4"
                            >
                                {submitOrder.isPending ? "Submitting..." : "Finalize Order"}
                            </Button>
                        </div>

                        <ProductModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            products={products}
                            addedProducts={addedProducts}
                            onAddProduct={addProduct}
                            onRemoveProduct={removeProduct}
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            isLoading={isProductsLoading}
                            onSearch={debouncedSearch}
                        />

                        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Order</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to submit this order with {addedProducts.length} products?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={confirmOrder}>Confirm</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </div>
                ) : prescriptionData && <AdminPrescriptionPreview handleStatusUpload={handleStatusChange} prescriptionId={id || ''} isUploading={createPrescriptionOrder.isPending} />
            }
        </div>
    )
}

export default SinglePrescriptionView
