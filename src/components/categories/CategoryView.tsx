import DataTable from "../Datatable/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/API";
import { CATEGORY_API } from "@/utils/API-ROUTES";
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

interface Category {
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

interface CategoryResponse {
    status: string
    message: string
    data: Category[]
}

export default function CategoryView() {
    const fetchCategories = async (): Promise<CategoryResponse> => {
        const response = await axiosInstance.get(CATEGORY_API)
        return response.data
    }

    const { data: categoryResponse, isLoading, error, refetch } = useQuery<CategoryResponse>({
        queryKey: ['categories'],
        queryFn: fetchCategories
    })

    const categoryDeleteMutation = useMutation({
        mutationFn: (categoryId: string) => {
            return axiosInstance.delete(`${CATEGORY_API}/${categoryId}`)
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
    const categoryMultipleDeleteMutation = useMutation({
        mutationFn: (categoryIds: string[]) => {
            return axiosInstance.delete(CATEGORY_API, { data: { ids: categoryIds } })
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

    const onDelete = (categoryId: string) => {
        categoryDeleteMutation.mutate(categoryId)
    }

    const onDeleteSelected = (categoryIds: string[]) => {
        categoryMultipleDeleteMutation.mutate(categoryIds)
    }

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] bg-white rounded-lg dark:bg-zinc-900 overflow-y-auto`}>
            <DataTable
                columns={columns}
                data={categoryResponse?.data || []}
                title="Categories"
                onDelete={onDelete}
                onDeleteSelected={onDeleteSelected}
                isLoading={isLoading}
                isDeleting={categoryDeleteMutation.isPending || categoryMultipleDeleteMutation.isPending}
                error={error?.message}
                totalCount={categoryResponse?.data?.length || 0}
                editPath="/admin/categories/edit"
            />
        </div>
    )
}
