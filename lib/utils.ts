import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import qs from 'query-string'
import { UrlQueryParams, RemoveUrlQueryParams } from '@/types'

// Combine class names using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Format a date string into various formats
export const formatDateTime = (dateString: Date) => {
  const date = new Date(dateString)

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  return {
    dateTime: date.toLocaleString('en-US', dateTimeOptions),
    dateOnly: date.toLocaleString('en-US', dateOptions),
    timeOnly: date.toLocaleString('en-US', timeOptions),
  }
}

// Convert a file to a URL
export const convertFileToUrl = (file: File): string => URL.createObjectURL(file)

// Format a price string into USD currency format
export const formatPrice = (price: string): string => {
  const amount = parseFloat(price)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Form a URL query string from parameters
export function formUrlQuery({ params, key, value }: UrlQueryParams): string {
  const currentUrl = qs.parse(params)
  currentUrl[key] = value
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

// Remove specified keys from a URL query string
export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams): string {
  const currentUrl = qs.parse(params)
  keysToRemove.forEach(key => delete currentUrl[key])
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

// Handle errors consistently
export const handleError = (error: unknown): void => {
  console.error(error)
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
}
