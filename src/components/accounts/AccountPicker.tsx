import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccounts, type Account } from "@/hooks/useAccounts";

interface AccountPickerProps {
  value?: string;
  onChange: (accountId: string | undefined, account?: Account) => void;
  placeholder?: string;
  category?: string;
  disabled?: boolean;
  excludeIds?: string[];
  postingOnly?: boolean;
}

export function AccountPicker({
  value,
  onChange,
  placeholder = "Select account...",
  category,
  disabled = false,
  excludeIds = [],
  postingOnly = false,
}: AccountPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: accounts, isLoading } = useAccounts({ isActive: true, category });

  const filteredAccounts = (accounts?.filter((a) => {
    if (excludeIds.includes(a.id)) return false;
    if (postingOnly && a.is_header) return false;
    return true;
  })) || [];
  const selectedAccount = accounts?.find((a) => a.id === value);

  // Group accounts by category
  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const category = account.account_type?.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  const categoryLabels: Record<string, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    revenue: "Revenue",
    expense: "Expenses",
    other: "Other",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {selectedAccount ? (
            <span className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">
                {selectedAccount.account_number}
              </span>
              <span>{selectedAccount.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            {Object.entries(groupedAccounts).map(([cat, accts]) => (
              <CommandGroup key={cat} heading={categoryLabels[cat] || cat}>
                {accts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={`${account.account_number} ${account.name}`}
                    onSelect={() => {
                      onChange(account.id, account);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === account.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-mono text-muted-foreground mr-2">
                      {account.account_number}
                    </span>
                    <span>{account.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
