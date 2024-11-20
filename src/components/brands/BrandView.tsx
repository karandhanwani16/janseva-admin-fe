import DataTable from "../Datatable/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/API";
import { BRAND_API } from "@/utils/API-ROUTES";
import toast from "react-hot-toast";
const columns = [
    {
        header: 'Name',
        accessorKey: 'name',
    }, {
        header: 'Description',
        accessorKey: 'description',
    }, {
        header: 'Created By',
        accessorKey: 'createdBy',
    }, {
        header: 'Updated By',
        accessorKey: 'updatedBy',
    }
]

interface Brand {
    id: string
    name: string
    description: string
    logoUrl: string | null
    websiteUrl: string | null
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
}

interface BrandResponse {
    status: string
    message: string
    data: Brand[]
}

export default function BrandView() {
    const fetchBrands = async (): Promise<BrandResponse> => {
        const response = await axiosInstance.get(BRAND_API)
        return response.data
    }

    const { data: brandResponse, isLoading, error, refetch } = useQuery<BrandResponse>({
        queryKey: ['companies'],
        queryFn: fetchBrands
    })

    const brandDeleteMutation = useMutation({
        mutationFn: (brandId: string) => {
            return axiosInstance.delete(`${BRAND_API}/${brandId}`)
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
    const brandMultipleDeleteMutation = useMutation({
        mutationFn: (brandIds: string[]) => {
            return axiosInstance.delete(BRAND_API, { data: { ids: brandIds } })
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

    const onDelete = (brandId: string) => {
        brandDeleteMutation.mutate(brandId)
    }

    const onDeleteSelected = (brandIds: string[]) => {
        brandMultipleDeleteMutation.mutate(brandIds)
    }

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] bg-white rounded-lg dark:bg-zinc-900 overflow-y-auto`}>
            <DataTable
                columns={columns}
                data={brandResponse?.data || []}
                title="Companies"
                onDelete={onDelete}
                onDeleteSelected={onDeleteSelected}
                isLoading={isLoading}
                isDeleting={brandDeleteMutation.isPending || brandMultipleDeleteMutation.isPending}
                error={error?.message}
                totalCount={brandResponse?.data?.length || 0}
                editPath="/admin/companies/edit"
            />
        </div>
    )
}
