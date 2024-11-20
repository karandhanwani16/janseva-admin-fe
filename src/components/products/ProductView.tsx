import DataTable from "../Datatable/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/API";
import { PRODUCT_API } from "@/utils/API-ROUTES";
import toast from "react-hot-toast";

const columns = [
    {
        header: 'ID',
        accessorKey: 'id',
    },
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Company',
        accessorKey: 'brand',
    },
    {
        header: 'Category',
        accessorKey: 'category',
    }, {
        header: "Product Variations",
        accessorKey: "productVariations",
    }, {
        header: "Has Alternative",
        accessorKey: "hasAlternative",
    },
    {
        header: 'Created By',
        accessorKey: 'createdBy',
    }, {
        header: 'Updated By',
        accessorKey: 'updatedBy',
    }
]


interface ProductResponse {
    status: string
    message: string
    // data: Product[]
    data: any[]
}

export default function ProductView() {
    const fetchProducts = async (): Promise<ProductResponse> => {
        const response = await axiosInstance.get(PRODUCT_API)
        return response.data
    }

    const { data: productResponse, isLoading, error, refetch } = useQuery<ProductResponse>({
        queryKey: ['companies'],
        queryFn: fetchProducts
    })

    const productDeleteMutation = useMutation({
        mutationFn: (productId: string) => {
            return axiosInstance.delete(`${PRODUCT_API}/${productId}`)
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
                refetch(); // Refresh data after successful deletion
            } else {
                toast.error(message)
            }
        }
    })
    const productMultipleDeleteMutation = useMutation({
        mutationFn: (productIds: string[]) => {
            return axiosInstance.delete(PRODUCT_API, { data: { ids: productIds } })
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
                refetch(); // Refresh data after successful deletion
            } else {
                toast.error(message)
            }
        }
    })

    const onDelete = (productId: string) => {
        productDeleteMutation.mutate(productId)
    }

    const onDeleteSelected = (productIds: string[]) => {
        productMultipleDeleteMutation.mutate(productIds)
    }

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] bg-white rounded-lg dark:bg-zinc-900 overflow-y-auto`}>
            <DataTable
                columns={columns}
                data={productResponse?.data || []}
                title="Products"
                onDelete={onDelete}
                onDeleteSelected={onDeleteSelected}
                isLoading={isLoading}
                isDeleting={productDeleteMutation.isPending || productMultipleDeleteMutation.isPending}
                error={error?.message}
                totalCount={productResponse?.data?.length || 0}
                editPath="/admin/products/edit"
            />
        </div>
    )
}
