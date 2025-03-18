import DataTable from "../Datatable/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/API";
import { COUPON_API } from "@/utils/API-ROUTES";
import toast from "react-hot-toast";
import { Badge } from "../ui/badge";

const columns = [
    {
        header: 'Code',
        accessorKey: 'code',
    }, {
        header: 'Discount',
        accessorKey: 'discountValue',
    },{
        header: 'Discount Type',
        accessorKey: 'discountType',
    }, {
        header: 'Valid From',
        accessorKey: 'startDate',
        cell: (row: any) => {
            const date = new Date(row.getValue());
            return <span>{date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}</span>
        }
    }, {
        header: 'Valid Until',
        accessorKey: 'endDate',
        cell: (row: any) => {
            const date = new Date(row.getValue());
            return <span>{date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short', 
                day: 'numeric'
            })}</span>
        }
    }, {
        header: 'Status',
        accessorKey: 'isActive',
        cell: (row: any) => {
            
            return row.getValue() ? <Badge variant="default" className="bg-green-500 text-white">Active</Badge> : <Badge variant="outline" className="bg-red-500 text-white">Inactive</Badge>
        }
    }
]

interface Coupon {
    id: string
    code: string
    discount: number
    validFrom: string
    validUntil: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
}

interface CouponResponse {
    status: string
    message: string
    data: {
        data: Coupon[]
        total: number
    }
}

export default function CouponView() {
    const fetchCoupons = async ({ pageSize = 10, pageIndex = 0 }): Promise<CouponResponse> => {
        const offset = pageIndex * pageSize
        const response = await axiosInstance.get(`${COUPON_API}?limit=${pageSize}&offset=${offset}`)
        return response.data
    }

    const { data: couponResponse, isLoading, error, refetch } = useQuery<CouponResponse>({
        queryKey: ['coupons'],
        queryFn: () => fetchCoupons({ pageSize: 10, pageIndex: 0 })
    })

    const couponDeleteMutation = useMutation({
        mutationFn: (couponId: string) => {
            return axiosInstance.delete(`${COUPON_API}/${couponId}`)
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

    const couponMultipleDeleteMutation = useMutation({
        mutationFn: (couponIds: string[]) => {
            return axiosInstance.delete(COUPON_API, { data: { ids: couponIds } })
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

    const onDelete = (couponId: string) => {
        couponDeleteMutation.mutate(couponId)
    }

    const onDeleteSelected = (couponIds: string[]) => {
        couponMultipleDeleteMutation.mutate(couponIds)
    }

    // const handlePageChange = async (pageIndex: number, pageSize: number) => {
    //     await refetch({
    //         queryKey: ['coupons', pageIndex, pageSize],
    //         queryFn: () => fetchCoupons({ pageSize, pageIndex })
    //     })
    // }

    console.log(couponResponse?.data?.data);
    

    return (
        <div className={`w-full h-[calc(100%-1.5rem)] bg-white rounded-lg dark:bg-zinc-900 overflow-y-auto`}>
            <DataTable
                columns={columns}
                data={couponResponse?.data?.data || []}
                title="Coupons"
                onDelete={onDelete}
                onDeleteSelected={onDeleteSelected}
                isLoading={isLoading}
                isDeleting={couponDeleteMutation.isPending || couponMultipleDeleteMutation.isPending}
                error={error?.message}
                editPath="/admin/coupons/edit"
                totalCount={couponResponse?.data?.total || 0}
            />
            {/* pageSize={10} */}
            {/* onPageChange={handlePageChange} */}
        </div>
    )
}
