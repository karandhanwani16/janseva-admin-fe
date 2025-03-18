import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Product } from '@/components/products/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  addedProducts: { product: Product, selectedVariationId?: string }[]
  onAddProduct: (product: Product, selectedVariationId?: string) => void
  onRemoveProduct: (product: Product) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  onSearch: (term: string) => void
}

export function ProductModal({
  isOpen,
  onClose,
  products,
  addedProducts,
  onAddProduct,
  onRemoveProduct,
  page,
  totalPages,
  onPageChange,
  isLoading,
  onSearch
}: ProductModalProps) {
  const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const observer = useRef<IntersectionObserver>()
  const isLoadingRef = useRef(isLoading)
  const searchTimeout = useRef<NodeJS.Timeout>()
  
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingRef.current) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages && !isLoadingRef.current) {
        isLoadingRef.current = true
        onPageChange(page + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [page, totalPages, onPageChange])

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    // Auto-select variants for products with only one variation
    const initialSelections = { ...selectedVariations }
    products?.forEach(product => {
      if (product.productVariationsList?.length === 1) {
        initialSelections[product.id] = product.productVariationsList[0].id
      }
    })
    setSelectedVariations(initialSelections)
  }, [products])

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      onSearch(searchTerm)
    }, 500)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchTerm, onSearch])

  const getSelectedVariationPrice = (product: Product) => {
    const selectedVariationId = selectedVariations[product.id]
    const selectedVariation = product.productVariationsList?.find(v => v.id === selectedVariationId)
    return selectedVariation?.price
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Products</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid gap-4 py-4">
          {products && products?.map((product, index) => (
            <div
              key={product.id}
              ref={index === products.length - 1 ? lastProductElementRef : null}
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded-md h-[48px] w-[48px] object-cover"
                />
                <div className="flex flex-col">
                  <span>{product.name}</span>
                  {product.productVariationsList && product.productVariationsList.length > 1 && (
                    <>
                      <Select
                        value={selectedVariations[product.id]}
                        onValueChange={(value) => setSelectedVariations({ ...selectedVariations, [product.id]: value })}
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
                      {selectedVariations[product.id] && (
                        <span className="text-sm text-gray-500 mt-2">
                          Price: ₹{getSelectedVariationPrice(product)} | Units: {product.productVariationsList.find(v => v.id === selectedVariations[product.id])?.units}
                        </span>
                      )}
                    </>
                  )}
                  {product.productVariationsList && product.productVariationsList.length === 1 && (
                    <span className="text-sm text-gray-500 mt-2">
                      {product.productVariationsList[0].name} - {product.productVariationsList[0].units} units - ₹{product.productVariationsList[0].price}
                    </span>
                  )}
                </div>
              </div>
              {addedProducts.some((p) => p.product.id === product.id) ? (
                <Button variant="destructive" onClick={() => onRemoveProduct(product)}>
                  Remove
                </Button>
              ) : (
                <Button
                  onClick={() => onAddProduct(product, selectedVariations[product.id])}
                  disabled={product.productVariationsList && product.productVariationsList.length > 1 && !selectedVariations[product.id]}
                >
                  Add
                </Button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center py-4 text-gray-700">
              Loading more products...
            </div>
          )}
          {!isLoading && page < totalPages && (
            <div className="flex justify-center py-4">
              <Button onClick={() => onPageChange(page + 1)}>Load More</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
