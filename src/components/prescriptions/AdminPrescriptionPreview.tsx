// import { useEffect, useState } from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Phone, ZoomIn } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { PRESCRIPTION_API } from '@/utils/API-ROUTES'
import axiosInstance from '@/utils/API'
import { useQuery } from '@tanstack/react-query'
import { PrescriptionStatus } from './types'


// interface Prescription{
//   imageUrl: string
//   patientName: string
//   doctorName: string
//   prescriptionDate: string
//   patientPhone: string
//   products: {
//     id: string
//     name: string
//     dosage: string
//     imageUrl: string
//   }[]
// }



export function AdminPrescriptionPreview({prescriptionId,handleStatusUpload,isUploading}: {prescriptionId: string,handleStatusUpload: (status: PrescriptionStatus, rejectionReason?: string) => void,isUploading: boolean}) {
  const [status, setStatus] = useState<PrescriptionStatus>("IN_REVIEW");
  const [rejectionReason, setRejectionReason] = useState('')

  const handleStatusChange = (newStatus: PrescriptionStatus) => {
    setStatus(newStatus)
  }

  const handleSubmit = () => {
    handleStatusUpload(status, rejectionReason)
  }

  const { data: prescription, isLoading } = useQuery({
    queryKey: ['prescription', prescriptionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${PRESCRIPTION_API}/${prescriptionId}`)
      return response.data.data
    },
    enabled: !!prescriptionId,
    refetchOnMount: true
  })

  console.log("prescription", prescription);
  
  

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }
  
  if (!prescription) {
    return <div className="w-full h-full flex items-center justify-center">
      <p>No prescription found</p>
    </div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Prescription Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full h-64">
          <img
            src={prescription.prescriptionUrl || "/placeholder.svg"}
            alt="Prescription"
            className="object-cover rounded-md h-full w-full"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className="absolute bottom-2 right-2">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <img
                src={prescription.prescriptionUrl || "/placeholder.svg"}
                alt="Prescription"
                className="w-full h-auto object-cover"
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Patient Name</h3>
            <p>{prescription.patientName}</p>
          </div>
          <div>
            <h3 className="font-semibold">Patient Age</h3>
            <p>{prescription.patientAge}</p>
          </div>
          <div>
            <h3 className="font-semibold">Prescription Date</h3>
            <p>{prescription.updatedAt}</p>
          </div>
          <div>
            <h3 className="font-semibold">Patient Phone</h3>
            <div className="flex items-center space-x-2">
              <p>{prescription.userPhone}</p>
              <Button size="icon" variant="outline" onClick={() => window.location.href = `tel:${prescription.userPhone}`}>
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call patient</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="status" className="font-semibold">Status:</label>
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">Approve</SelectItem>
                <SelectItem value="REJECTED">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'REJECTED' && (
            <Textarea
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}

          <Button onClick={handleSubmit} disabled={isUploading || (status === 'REJECTED' && !rejectionReason)}>
            Submit Decision
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
