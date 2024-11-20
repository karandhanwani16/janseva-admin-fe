import { useTheme } from "@/store/useTheme";
import { Link, Outlet, useLocation } from "react-router-dom";

interface Tab {
    path: string;
    activeWhen: string;
    label: string;
    visible: boolean;
}

interface SubPageLayoutProps {
    tabs: Tab[];
    defaultTab: string;
    title: string;
}

function SubPageLayout({ tabs, defaultTab, title }: SubPageLayoutProps) {
    const { isDarkMode } = useTheme();
    const location = useLocation();
    const currentPath = location.pathname.split('/') || [defaultTab];

    const isTabActive = (activeWhen: string) => {
        const patterns = activeWhen.split('|');
        return patterns.some(pattern => currentPath.includes(pattern));
    };

    return (
        <>
            <div className="space-y-6 h-full">
                <h1 className="text-2xl font-bold">{title}</h1>

                <div className="h-full space-y-2">
                    <div className="flex items-center justify-between">
                        <div className={`p-1 border gap-1 flex rounded-md ${isDarkMode ? "border-zinc-700 bg-zinc-800" : "border-zinc-300 bg-white"}`}>
                            {tabs.filter(tab => tab.visible).map((tab) => (
                                <Link
                                    key={tab.path}
                                    to={tab.path}
                                    className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors
                                        ${isTabActive(tab.activeWhen) ?
                                            (isDarkMode ? "bg-white text-black" : "bg-black text-white") :
                                            (isDarkMode ? "hover:text-slate-200 hover:bg-zinc-700" : "hover:text-slate-800 hover:bg-zinc-300")
                                        }`}
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="h-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default SubPageLayout