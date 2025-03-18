import DataTable from "../Datatable/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/API";
import { PRESCRIPTION_API } from "@/utils/API-ROUTES";
import toast from "react-hot-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const columns = [
    {
        header: 'Patient Name',
        accessorKey: 'patientName',
    },
    {
        header: 'Prescription Status',
        accessorKey: 'status',
        cell: ({ row }: { row: any }) => {
            const status = row.original.status;
            let bgColor = '';
            switch (status) {
                case 'UPLOADED':
                    bgColor = 'bg-yellow-500 text-white';
                    break;
                case 'ORDERED':
                    bgColor = 'bg-green-500 text-white';
                    break;
                case 'REJECTED':
                    bgColor = 'bg-red-500 text-white';
                    break;
                default:
                    bgColor = 'bg-gray-500 text-white';
            }
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                    {status}
                </span>
            );
        }
    },
    {
        header: 'User Name',
        accessorKey: 'userName',
    },
    {
        header: 'Patient Age',
        accessorKey: 'patientAge',
    },
    {
        header: 'Patient Gender',
        accessorKey: 'patientGender',
    },
    {
        header: 'Patient Weight',
        accessorKey: 'patientWeight',
    },
    {
        header: 'Patient Height',
        accessorKey: 'patientHeight',
    },
    {
        header: 'Created At',
        accessorKey: 'createdAt',
    }, {
        header: 'Updated At',
        accessorKey: 'updatedAt',
    }
]

interface Prescription {
    id: string
    userName: string
    prescriptionStatus: string
    patientName: string
    patientAge: string
    patientGender: string
    patientWeight: string
    patientHeight: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
}

interface PrescriptionResponse {
    status: string
    message: string
    data: Prescription[]
}

export default function PrescriptionView() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const fetchPrescriptions = async (): Promise<PrescriptionResponse> => {
        const response = await axiosInstance.get(PRESCRIPTION_API)
        return response.data
    }

    const { data: prescriptionResponse, isLoading, error, refetch } = useQuery<PrescriptionResponse>({
        queryKey: ['companies'],
        queryFn: fetchPrescriptions
    })

    const prescriptionDeleteMutation = useMutation({
        mutationFn: (prescriptionId: string) => {
            return axiosInstance.delete(`${PRESCRIPTION_API}/${prescriptionId}`)
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
                refetch();
            } else {
                toast.error(message)
            }
        }
    })

    const prescriptionMultipleDeleteMutation = useMutation({
        mutationFn: (prescriptionIds: string[]) => {
            return axiosInstance.delete(PRESCRIPTION_API, { data: { ids: prescriptionIds } })
        },
        onSuccess: (response) => {
            const { data: { status, message } } = response;
            if (status === "success") {
                toast.success(message);
                refetch();
            } else {
                toast.error(message)
            }
        }
    })

    const onDelete = (prescriptionId: string) => {
        prescriptionDeleteMutation.mutate(prescriptionId)
    }

    const onDeleteSelected = (prescriptionIds: string[]) => {
        prescriptionMultipleDeleteMutation.mutate(prescriptionIds)
    }

    const filteredData = prescriptionResponse?.data.filter((prescription: any) =>
        statusFilter === "ALL" ? true : prescription.status === statusFilter
    ) || [];

    
    return (
        <div className={`w-full h-[calc(100%-1.5rem)] bg-white rounded-lg dark:bg-zinc-900 overflow-y-auto`}>
            <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Status Filter:</h2>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="UPLOADED">
                                <div className="flex items-center gap-2">
                                    <span className="h-[8px] w-[8px] bg-yellow-500 rounded-full"></span>
                                    <p>Uploaded</p>
                                </div>
                            </SelectItem>
                            <SelectItem value="APPROVED">
                                <div className="flex items-center gap-2">
                                    <span className="h-[8px] w-[8px] bg-orange-500 rounded-full"></span>
                                    <p>Approved</p>
                                </div>
                            </SelectItem>
                            <SelectItem value="ORDERED">
                                <div className="flex items-center gap-2">
                                    <span className="h-[8px] w-[8px] bg-green-500 rounded-full"></span>
                                    <p>Ordered</p>
                                </div>
                            </SelectItem>
                            <SelectItem value="REJECTED">
                                <div className="flex items-center gap-2">
                                    <span className="h-[8px] w-[8px] bg-red-500 rounded-full"></span>
                                    <p>Rejected</p>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredData}
                title="Prescriptions"
                onDelete={onDelete}
                onDeleteSelected={onDeleteSelected}
                isLoading={isLoading}
                isDeleting={prescriptionDeleteMutation.isPending || prescriptionMultipleDeleteMutation.isPending}
                error={error?.message}
                totalCount={filteredData.length}
                editPath="/admin/prescriptions/single"
            />
        </div>
    )
}
