import { useToast } from "./use-toast"
import { Toast } from "./Toast"
import { AnimatePresence } from "framer-motion"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 right-0 z-[100] flex flex-col p-4 gap-2 w-full max-w-md sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse">
            <AnimatePresence mode="popLayout">
                {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                    return (
                        <Toast
                            key={id}
                            title={title}
                            description={description}
                            action={action}
                            variant={variant}
                            onDismiss={() => dismiss(id)}
                            {...props}
                        />
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
