import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RecommendationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  saveAmount: string;
  onSave: () => void;
  onDismiss: () => void;
}

export const RecommendationCard = ({
  icon: Icon,
  title,
  description,
  saveAmount,
  onSave,
  onDismiss,
}: RecommendationCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} className="flex-1">
          Save {saveAmount}
        </Button>
        <Button onClick={onDismiss} variant="secondary" className="flex-1">
          Dismiss
        </Button>
      </div>
    </Card>
  );
};
