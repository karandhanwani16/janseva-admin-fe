'use client'

import { useForm } from 'react-hook-form'
import { Moon, Sun, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from '@/store/useTheme'
import toast from 'react-hot-toast'
import { useState } from 'react'
import axiosInstance from '@/utils/API'
import { useMutation } from '@tanstack/react-query'
import { LOGIN_API } from '@/utils/API-ROUTES'
import useAuthStore from '@/store/useAuth'
import { useNavigate } from 'react-router-dom'
import { ADMIN_HOME_UI } from '@/utils/ROUTES'

type FormData = {
    email: string
    password: string
}

export default function LoginPage() {
    const { isDarkMode, toggleTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (data: FormData) => axiosInstance.post(LOGIN_API, data),
        onSuccess: (response) => {
            const { data: { success, user, message, accessToken } } = response.data;

            if (success) {
                if (user.role.toLowerCase() === "admin") {
                    login(user, accessToken);
                    toast.success(message);
                    navigate(ADMIN_HOME_UI);
                } else {
                    toast.error("You are not authorized to access this page");
                }
            } else {
                toast.error(message);
            }
        },
        onError: (error) => {

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(error);
            }
        }
    });

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data);
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-background ${isDarkMode ? 'dark' : ''}`}>
            <Card className="w-full max-w-md ">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        </Button>
                    </div>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    placeholder="********"
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        }
                                    })}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                </CardContent>             </Card>
        </div>
    )
}