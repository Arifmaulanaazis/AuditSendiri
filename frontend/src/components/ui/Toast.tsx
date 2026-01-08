import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pl-4 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "glass text-foreground border-border",
                destructive:
                    "glass border-destructive/50 text-destructive bg-destructive/10 dark:bg-destructive/20",
                success: "glass border-primary/50 text-primary bg-primary/10 dark:bg-primary/20",
                warning: "glass border-yellow-500/50 text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface ToastProps
    extends Omit<HTMLMotionProps<"div">, "title">,
    VariantProps<typeof toastVariants> {
    onDismiss?: () => void
    description?: React.ReactNode
    title?: React.ReactNode
    action?: React.ReactNode
}

export function Toast({ className, variant, title, description, action, onDismiss, onOpenChange, ...props }: ToastProps & { onOpenChange?: (open: boolean) => void }) {
    const Icon = {
        default: Info,
        destructive: AlertCircle,
        success: CheckCircle,
        warning: AlertTriangle
    }[variant || 'default'] || Info

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        >
            <div className="flex gap-3 w-full">
                <div className={cn("mt-1", {
                    "text-primary": variant === 'success',
                    "text-destructive": variant === 'destructive',
                    "text-yellow-500": variant === 'warning',
                    "text-blue-500": variant === 'default',
                })}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    {title && <div className="text-sm font-semibold">{title}</div>}
                    {description && (
                        <div className="text-sm opacity-90 leading-relaxed mt-1">
                            {description}
                        </div>
                    )}
                </div>
                {action && (
                    <div className="flex items-center self-center">{action}</div>
                )}
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 text-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    )
}
