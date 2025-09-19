import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MultiSelectOption {
  value: string;
  label: string;
  user?: any; // User object for additional data
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className = "",
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className={cn(
          "min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
          disabled && "bg-gray-50 cursor-not-allowed",
          isOpen && "ring-2 ring-red-500 border-transparent"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option.value);
                }}
                className="hover:text-red-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedOptions.length === 0 && (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <ChevronDown className={cn("w-4 h-4 text-gray-400", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {selectedOptions.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between",
                    value.includes(option.value) && "bg-red-50 text-red-700"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.value);
                  }}
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <Check className="w-4 h-4 text-red-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
