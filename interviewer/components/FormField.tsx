import React from 'react'
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'file';
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: FormFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <input {...field} placeholder={placeholder} type={type} />
        </FormControl>
        <FormDescription>This is your {label.toLowerCase()}.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default FormField
