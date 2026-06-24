import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast !bg-overlay !border-white/[.12] !text-t1 !shadow-[0_12px_40px_rgba(0,0,0,.7)] !rounded-md !backdrop-blur-md',
          description: '!text-t2',
          actionButton: '!bg-brand !text-white',
          cancelButton: '!bg-raised !text-t2',
          success: '!border-ok/20 [&_[data-icon]]:!text-ok',
          error:   '!border-brand/20 [&_[data-icon]]:!text-[#f87171]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
