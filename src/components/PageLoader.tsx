import { Loader } from 'lucide-react'

function PageLoader() {
    return (
        <div className="absolute z-50 top-0 left-0 w-full h-full flex justify-center items-center bg-black/10 backdrop-blur-sm">
            <Loader className="animate-spin" />
        </div>
    )
}

export default PageLoader