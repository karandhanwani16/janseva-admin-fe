import React from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useController, Control } from "react-hook-form";
import { useTheme } from "@/store/useTheme";

interface FileUploadProps {
    name: string;
    control: Control<any>;
    multiple?: boolean;
    maxFiles?: number;
    accept?: Record<string, string[]>;
    existingImage?: string | null;
    isWidthFull?: boolean;
    onFileChange?: (files: File[]) => void;
}

export default function FileUpload({
    name,
    control,
    multiple = true,
    maxFiles = 10,
    accept = {
        "image/*": [".jpeg", ".jpg", ".png", ".gif"]
    },
    existingImage,
    isWidthFull = false,
    onFileChange
}: FileUploadProps) {
    const {
        field: { onChange, value }
    } = useController({
        name,
        control,
        defaultValue: multiple ? [] : null
    });

    const files = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

    const { isDarkMode } = useTheme();

    return (
        <Card className={`w-full ${isWidthFull ? "w-full" : "max-w-md"} ${isDarkMode ? "bg-zinc-800" : ""}`}>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div>
                        <Dropzone
                            onDrop={(acceptedFiles) => {
                                const validFiles = acceptedFiles.filter(file => file instanceof File);
                                const newFiles = multiple ? [...files, ...validFiles].slice(0, maxFiles) : [validFiles[0]];

                                onChange(multiple ? newFiles : newFiles[0]);
                                onFileChange?.(newFiles);
                            }}
                            isDarkMode={isDarkMode}
                            value={files}
                            onChange={onChange}
                            multiple={multiple}
                            maxFiles={maxFiles}
                            accept={accept}
                        />
                        {(files.length > 0 || existingImage) && (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {existingImage && files.length === 0 && (
                                    <div className="relative group">
                                        <img
                                            src={existingImage}
                                            alt="Existing image"
                                            className="w-full h-32 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                {files.map((file: File, index: number) => (
                                    <ImagePreview
                                        key={index}
                                        file={file}
                                        onRemove={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            //prevent submitting form
                                            e.preventDefault();
                                            const newFiles = [...files];
                                            newFiles.splice(index, 1);
                                            onChange(multiple ? newFiles : null);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const ImagePreview = ({
    file,
    onRemove,
}: {
    file: File;
    onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
    const [preview, setPreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!file || !(file instanceof File)) {
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setLoading(false);
        };
        reader.readAsDataURL(file);

        return () => {
            reader.abort();
        };
    }, [file]);

    return (
        <div className="relative group">
            {loading ? (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Loader className="animate-spin text-primary" size={24} />
                </div>
            ) : (
                <img
                    src={preview || ""}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                    onClick={onRemove}
                    className="bg-red-500 text-white rounded-full p-2 shadow-md transform transition-transform hover:scale-110"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

function Dropzone({
    onDrop,
    multiple,
    maxFiles,
    accept,
    isDarkMode
}: {
    onDrop: (files: File[]) => void;
    value: File[];
    onChange: (files: File[]) => void;
    multiple: boolean;
    maxFiles: number;
    accept: Record<string, string[]>;
    isDarkMode: boolean;
}) {
    const [isLoading, setIsLoading] = React.useState(false);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setIsLoading(true);
            setTimeout(() => {
                const validFiles = acceptedFiles.filter(file => file instanceof File);
                onDrop(validFiles);
                setIsLoading(false);
            }, 1000); // Simulate a delay for demonstration purposes
        },
        accept,
        multiple,
        maxFiles
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                ? "border-primary bg-primary/10"
                : `border-gray-300 hover:border-primary ${isDarkMode ? "hover:border-primary border-gray-700" : ""}`
                }`}
        >
            <input {...getInputProps()} />
            {isLoading ? (
                <Loader className="mx-auto text-primary animate-spin" size={48} />
            ) : (
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            )}
            {isDragActive ? (
                <p className="text-primary">Drop the files here ...</p>
            ) : (
                <p className="text-gray-500">
                    {isLoading
                        ? "Processing..."
                        : "Drag 'n' drop some files here, or click to select files"}
                </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, JPEG, PNG, GIF
            </p>
        </div>
    );
}
