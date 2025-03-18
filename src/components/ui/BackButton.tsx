import { Button } from './button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function BackButton() {

    const navigate = useNavigate()

    return (
        <div className="p-4 pb-0">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back
            </Button>
        </div>
    )
}

export default BackButton
