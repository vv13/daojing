import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>;

function Select({ ...props }: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectTrigger({
  className = '',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={`w-full border border-[color-mix(in_oklab,var(--border)_80%,var(--primary)_20%)] bg-[color-mix(in_oklab,var(--card-bg)_86%,var(--accent-light)_14%)] text-[color:var(--primary)] px-2.5 py-1.5 rounded-full text-[0.82rem] inline-flex items-center justify-between gap-2 cursor-pointer transition-transform active:scale-[0.98] ${className}`.trim()}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-[color:var(--primary-light)] shrink-0" aria-hidden="true">
        ▾
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

function SelectContent({
  className = '',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`z-[120] border border-(--border) bg-(--card-bg) rounded-xl shadow-[0_8px_20px_var(--shadow)] overflow-hidden ${className}`.trim()}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className = '',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={`relative py-[9px] pl-3 pr-[30px] text-[0.84rem] text-[color:var(--text-secondary)] cursor-pointer outline-none data-[highlighted]:bg-(--accent-light) data-[highlighted]:text-[color:var(--primary)] ${className}`.trim()}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[color:var(--primary)]">✓</SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
