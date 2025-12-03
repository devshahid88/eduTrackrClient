import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

// Tabs Component Types
export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  className?: string;
}

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  className?: string;
}

export interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  className?: string;
}

// Generic UI Component Props
export interface BaseUIProps {
  className?: string;
  children?: React.ReactNode;
}

// Common Radix UI Component Props
export interface RadixUIProps extends BaseUIProps {
  asChild?: boolean;
}

// Utility Types for forwardRef components
export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

// Common Size Variants
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

// Common Color Variants  
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Common Button/Interactive Element Variants
export interface VariantProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: SizeVariant;
}
