import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const models = [
  {
    value: 'gpt-5-2025-08-07',
    label: 'GPT-5',
    description: 'Most powerful, best quality',
  },
  {
    value: 'gpt-5-mini-2025-08-07',
    label: 'GPT-5 Mini',
    description: 'Faster and cheaper, still high quality',
  },
  {
    value: 'gpt-5-nano-2025-08-07',
    label: 'GPT-5 Nano',
    description: 'Fastest and cheapest, good for simple tasks',
  },
];

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-select" className="text-sm text-muted-foreground">
        AI Model
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="model-select" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              <div className="flex flex-col">
                <span className="font-medium">{model.label}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
