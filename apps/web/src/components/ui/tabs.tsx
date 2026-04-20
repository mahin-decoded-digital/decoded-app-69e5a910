import React from 'react';
import { cn } from '@/lib/utils';

export const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: '',
  onValueChange: () => {},
});

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleTabChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className, disabled }: { value: string; children: React.ReactNode; className?: string, disabled?: boolean }) => {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-muted-foreground/10",
        className
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;

  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  );
};
