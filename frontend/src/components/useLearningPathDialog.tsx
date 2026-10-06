import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LearningPathForm } from "@/components/ui/learning-path-form"
import * as React from "react"
import { Plus } from "lucide-react"

// props that let parent control if the dialog is open or closed
type LearningPathDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
}

export function LearningPathDialog({ open, onOpenChange, showTrigger = true }: LearningPathDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger render={
          <Button variant="outline" className="bg-primary hover:bg-background">
            <Plus className="mr-2 h-4 w-4" />
            Create Learning Path
          </Button>
        } />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Learning Path</DialogTitle>
          <DialogDescription>
            Enter a topic, level, and number of weeks. AI will generate your personalized plan.
          </DialogDescription>
        </DialogHeader>
        <LearningPathForm onCreateSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}